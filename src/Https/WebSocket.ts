import { createHash } from 'crypto';
import { Socket } from 'net';
import { Logger } from "../Log.js";
import { HttpRequest } from "./Request.js";

export enum WebsocketOpcode {
    CONTINUE = 0x0,
    TEXT     = 0x1,
    BINARY   = 0x2,
    CLOSE    = 0x8,
    PING     = 0x9,
    PONG     = 0xA,
};

export class WebSocketBase {
    protected _protocol?: string; 
    protected _socket: Socket;
    protected _closing: boolean = false;
    protected _on: {[key: string]: null|Function} = {};
    protected _keepAliveInterval?: NodeJS.Timeout;
    protected logger: Logger;
    private writeMask: boolean = false;

    protected closureCodeMsgs: {[key: number]: string} = {
        0: 'unknown',
        1000: 'indicates a normal closure, meaning that the purpose for which the connection was established has been fulfilled.',
        1001: 'indicates that an endpoint is "going away", such as a server going down or a browser having navigated away from a page.',
        1002: 'indicates that an endpoint is terminating the connection due to a protocol error.',
        1003: 'indicates that an endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).',
    };

    constructor(socket: Socket, logger: Logger, writeMask: boolean) {
        this._socket = socket;
        this.logger = logger;
        this.writeMask = writeMask;
        this._on = {
            open: null,
            text: null,
            data: null,
            close: null,
            end: null,
            error: null
        };
    }

    public on(eventType:string, handler:Function) {
        if (eventType in this._on)
            this._on[eventType] = handler;
        return this;
    }

    public write(opcode: WebsocketOpcode, msg?:string|Buffer) {
        if (typeof msg === 'string')
            msg = Buffer.from(msg);
        const fin = 1;
        const res = 0;
        const op = opcode ?? WebsocketOpcode.CONTINUE;
        let byte1 = ((fin & 0x1) << 7) | ((res & 0x7) << 4) | (op & 0xF);
        
        const hasMask = this.writeMask ? 1 : 0;
        let lenEx:number = 0;
        let lenExSize = 0;
        let len = msg?.length ?? 0;
        if (len >= 0x7E && len <= 0xFFFF) {
            lenEx = len;
            lenExSize = 2;
            len = 126;
        } else if (len > 0xFFFF) {
            lenEx = len;
            lenExSize = 8;
            len = 127;
        }
        let byte2 = ((hasMask & 0x1) << 7) | (len & 0x7F);
        
        let bufferOffset = 0;
        const buffer = Buffer.alloc(2 + lenExSize + (msg?.length ?? 0) + (hasMask ? 4 : 0));
        buffer.writeUInt8(byte1, bufferOffset++);
        buffer.writeUInt8(byte2, bufferOffset++);

        if (lenExSize === 2) {
            buffer.writeUInt16BE(lenEx, bufferOffset);
            bufferOffset += 2;
        } else if (lenExSize === 8) {
            buffer.writeBigUInt64BE(BigInt(lenEx), bufferOffset);
            bufferOffset += 8;
        }

        const mask = [
            0xa2,
            0x34,
            0xb4,
            0x02
        ];
        if (hasMask) {
            buffer.writeUInt8(mask[0], bufferOffset++);
            buffer.writeUInt8(mask[1], bufferOffset++);
            buffer.writeUInt8(mask[2], bufferOffset++);
            buffer.writeUInt8(mask[3], bufferOffset++);
        }

        msg?.forEach((el, i) => {
            if (hasMask) {
                buffer.writeUInt8(el ^ mask[i % 4], bufferOffset++);
            } else {
                buffer.writeUInt8(el, bufferOffset++);
            }
        });
        
        this.socket.write(buffer);
    }

    protected ping() {
        this.write(WebsocketOpcode.PING);
    }

    protected pong() {
        this.write(WebsocketOpcode.PONG);
    }

    public close() {
        this._closing = true;
        this.write(WebsocketOpcode.CLOSE);
        this.socket.end();
        this._onClose(1000);
    }

    public get socket() {
        return this._socket;
    }

    protected get _onOpen() {
        this.logger.verbose('connection opened');
        return !!this._on['open'] ? this._on['open'] : () => {};
    }

    protected get _onText() {
        return !!this._on['text'] ? this._on['text'] : () => {};
    }

    protected get _onData() {
        return !!this._on['data'] ? this._on['data'] : () => {};
    }

    protected get _onClose() {
        this.logger.verbose('connection closed');
        if (this._keepAliveInterval)
            clearInterval(this._keepAliveInterval);
        return !!this._on['close'] ? this._on['close'] : () => {};
    }

    protected get _onEnd() {
        this.logger.verbose('connection ended');
        return !!this._on['end'] ? this._on['end'] : () => {};
    }

    protected get _onError() {
        return !!this._on['error'] ? this._on['error'] : (err:string) => { throw new Error(err); };
    }
};

export class WebSocketConnection extends WebSocketBase {
    public id: number = -1;

    constructor(id: number, req: HttpRequest, socket: Socket, protocol?: string) {
        super(socket, new Logger('WebSocketConnection'), false);
        this._protocol = protocol;
        this.id = id;
        this._connect(req);
    }

    private _connect(req: HttpRequest) {
        let op: null|number = null;
        let runningIdx: number = 0;
        let len: number = 0;
        let count = 0;
        let mask: number[] = [];
        let msg: null|Buffer = null;
        let hasMask: boolean = false;

        this.socket.on('data', (buffer) => {
            let byteIdx = 0;
            while (byteIdx < buffer.length) {
                if (len === 0) {
                    let byte = buffer.readUInt8(byteIdx++);
                    const fin = (byte & 0x80) >> 7;
                    const res = (byte & 0x70) >> 4;
                    op = (byte & 0x0F) >> 0;

                    byte = buffer.readUInt8(byteIdx++);
                    hasMask = !!((byte & 0x80) >> 7);
                    len = (byte & 0x7F) >> 0;

                    if (len === 126) {
                        len = buffer.readUInt16BE(byteIdx);
                        byteIdx += 2;
                    } else if (len === 127) {
                        len = Number(buffer.readBigUInt64BE(byteIdx));
                        byteIdx += 8;
                    }
                    msg = Buffer.alloc(len);

                    if (hasMask) {
                        mask = [
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                        ];
                    }
                }

                const end = typeof len === 'bigint'
                    ? buffer.length
                    : Math.min(buffer.length, byteIdx + len);

                buffer.subarray(byteIdx, end).forEach((byte, i) => {
                    if (hasMask) {
                        msg?.writeUInt8(byte ^ mask[runningIdx % 4], i);
                    } else {
                        msg?.writeUInt8(byte, i);
                    }
                    runningIdx++;
                    byteIdx++;
                });

                count += buffer.length;
                if (count >= len) {
                    if (op === WebsocketOpcode.TEXT) {
                        this._onText(msg?.toString());
                    } else if (op === WebsocketOpcode.BINARY) {
                        this._onData(msg);
                    } else if (op === WebsocketOpcode.CLOSE) {
                        let code = 0;
                        if ((msg?.length ?? 0) > 0) {
                            code = msg?.readUInt16BE() ?? 0;
                            this.logger.verbose(`${code}: ` + this.closureCodeMsgs[code]);
                        }
                        
                        this._onClose(code);
                        if (!this._closing) {
                            this.write(WebsocketOpcode.CLOSE, Buffer.from([ 1001 ]));
                            this._closing = true;
                        }
                        this.socket.end();
                    } else if (op === WebsocketOpcode.PING) {
                        this.logger.verbose('ping');
                        this.write(WebsocketOpcode.PONG);
                    } else if (op === WebsocketOpcode.PONG) {
                        this.logger.verbose('pong');
                    } else {
                        this.logger.error(`${op}`);
                        throw new Error(`op, ${msg?.toString()}`);
                    }

                    len = 0;
                    mask = [];
                    runningIdx = 0;
                    op = null;
                    msg = null;
                }
            }
        }).on('end', () => {
            this._onEnd();
        }).on('error', (err) => {
            this._onError(err);
        });
        
        const acceptVal = this._getWebsocketAcceptValue(req.headers['sec-websocket-key'][0]);
        const wsVersion = this._getWebsocketAcceptValue(req.headers['sec-websocket-version'][0]);
        const headers = [
            'HTTP/1.1 101 Web Socket Protocol Handshake',
            'Upgrade: websocket',
            'Connection: upgrade',
            `Sec-WebSocket-Accept: ${acceptVal}`,
            '', ''
        ];
        const out = headers.join('\r\n');
        this.socket.write(out);

        this._onOpen();
        this._keepAliveInterval = setInterval(() => {
            this.ping();
            this.logger.verbose('ping');
        }, 1000);
    }

    _getWebsocketAcceptValue(key:string) {
        return createHash("sha1")
            .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
            .digest("base64");
    }
};

export class WebSocketClient extends WebSocketBase {
    public address: URL;

    constructor(address: string, protocol?: string) {
        super(new Socket({ allowHalfOpen: true, readable: true, writable: true }),
            new Logger('WebSocketClient'), true);
        this._protocol = protocol;
        this.address = new URL(address);
        this._connect();
    }

    private async _connect() {        
        this.socket.once('data', (buffer) => {
            const httpEnd = buffer.indexOf('\r\n\r\n') + 4;
            const httpStr = buffer.toString('utf8', 0, httpEnd);
            if (httpStr.indexOf('101') < 0) {
                throw '!error!';
            }

            if (httpEnd < buffer.length) {
                this.handleData(buffer.subarray(httpEnd));
            }
            
            this.socket.on('data', this.handleData.bind(this));
        }).on('end', () => {
            this._onEnd();
        }).on('error', (err) => {
            this._onError(err);
        });
        
        this.socket.connect({
            host: this.address.hostname,
            port: Number.parseInt(this.address.port),
            keepAlive: true
        }, () => {
            const headers = [
                `GET ${this.address.pathname} HTTP/1.1`,
                `Host: ${this.address.host}`,
                'Upgrade: websocket',
                'Connection: upgrade',
                'sec-websocket-key: test',
                'sec-websocket-version: 13',
                `sec-websocket-protocol: ${this._protocol}`,
                '', ''
            ];
            const out = headers.join('\r\n');
            this.socket.write(out);
            this._onOpen();
        });
    }

    private handleData(buffer: Buffer) {
        let op: null|number = null;
        let runningIdx: number = 0;
        let len: number = 0;
        let count = 0;
        let mask: number[] = [];
        let msg: null|Buffer = null;
        let byteIdx = 0;
        let hasMask = false;

        while (byteIdx < buffer.length) {
            if (len === 0) {
                let byte = buffer.readUInt8(byteIdx++);
                const fin = (byte & 0x80) >> 7;
                const res = (byte & 0x70) >> 4;
                op = (byte & 0x0F) >> 0;

                byte = buffer.readUInt8(byteIdx++);
                hasMask = !!((byte & 0x80) >> 7);
                len = (byte & 0x7F) >> 0;

                if (len !== 0) {
                    if (len === 126) {
                        len = buffer.readUInt16BE(byteIdx);
                        byteIdx += 2;
                    } else if (len === 127) {
                        len = Number(buffer.readBigUInt64BE(byteIdx));
                        byteIdx += 8;
                    }
                    msg = Buffer.alloc(len);

                    if (hasMask) {
                        mask = [
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                            buffer.readUInt8(byteIdx++),
                        ];
                    }
                }
            }

            const end = typeof len === 'bigint'
                ? buffer.length
                : Math.min(buffer.length, byteIdx + len);

            buffer.subarray(byteIdx, end).forEach((byte, i) => {
                if (hasMask) {
                    msg?.writeUInt8(byte ^ mask[runningIdx % 4], i);
                } else {
                    msg?.writeUInt8(byte, i);
                }
                runningIdx++;
                byteIdx++;
            });

            count += buffer.length;
            if (count >= len) {
                if (op === WebsocketOpcode.TEXT) {
                    this._onText(msg?.toString());
                } else if (op === WebsocketOpcode.BINARY) {
                    this._onData(msg);
                } else if (op === WebsocketOpcode.CLOSE) {
                    let code = 0;
                    if ((msg?.length ?? 0) > 0) {
                        code = msg?.readUInt16BE() ?? 0;
                        this.logger.verbose(`${code}: ` + this.closureCodeMsgs[code]);
                    }
                    
                    this._onClose(code);
                    if (!this._closing) {
                        this.write(WebsocketOpcode.CLOSE, Buffer.from([ 1001 ]));
                        this._closing = true;
                    }
                    this.socket.end();
                } else if (op === WebsocketOpcode.PING) {
                    this.logger.verbose('ping');
                    this.write(WebsocketOpcode.PONG);
                } else if (op === WebsocketOpcode.PONG) {
                    this.logger.verbose('pong');
                } else {
                    this.logger.error(`${op}`);
                    throw new Error(`op, ${msg?.toString()}`);
                }

                len = 0;
                mask = [];
                runningIdx = 0;
                op = null;
                msg = null;
            }
        }
    }
};
