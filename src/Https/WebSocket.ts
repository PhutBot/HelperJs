import { createHash } from "crypto";
import { Socket } from 'net';
import { Logger } from "../Log";
import { HttpRequest } from "./Request";
const log = new Logger();


export class WebSocketConnection {
    id:number = -1;
    _socket:Socket;
    _closing:boolean = false;
    _on:{[key:string]:null|Function} = {};
    _keepAliveInterval?:NodeJS.Timer;

    closureCodeMsgs:{[key:number]:string} = {
        0: 'unknown',
        1000: 'indicates a normal closure, meaning that the purpose for which the connection was established has been fulfilled.',
        1001: 'indicates that an endpoint is "going away", such as a server going down or a browser having navigated away from a page.',
        1002: 'indicates that an endpoint is terminating the connection due to a protocol error.',
        1003: 'indicates that an endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).',
    };

    constructor(id:number, req:HttpRequest, socket:Socket) {
        this.id = id;
        this._socket = socket;
        this._on = {
            open: null,
            text: null,
            data: null,
            close: null,
            end: null,
            error: null
        };

        this._connect(req);
    }

    on(eventType:string, handler:Function) {
        if (eventType in this._on)
            this._on[eventType] = handler;
        return this;
    }

    write(msg:string|Buffer, options:{op?:number}={}) {
        // msg = msg || '';
        options = Object.assign({
            op: 0x1
        }, options);

        const fin = 1;
        const res = 0;
        const op = options.op ?? 0;
        let byte1 = ((fin & 0x1) << 7) | ((res & 0x7) << 4) | (op & 0xF);
        
        const hasMask = 0;
        let lenEx:number = 0;
        let lenExSize = 0;
        let len = msg.length;
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
        
        const buffer = Buffer.alloc(2 + lenExSize + msg.length);
        buffer.writeUInt8(byte1, 0);
        buffer.writeUInt8(byte2, 1);

        if (lenExSize === 2) {
            buffer.writeUInt16BE(lenEx, 2);
        } else if (lenExSize === 8) {
            buffer.writeBigUInt64BE(BigInt(lenEx), 2);
        }

        buffer.write(msg.toString(), 2 + lenEx, 'utf-8');
        this.socket.write(buffer);
    }

    ping() {
        this.write('', { op: 0x9 });
    }

    close() {
        this._closing = true;
        this.write('', { op: 0x8 });
        this.socket.end();
        this._onClose(1000);
    }

    _connect(req:HttpRequest) {
        let op:null|number = null;
        let runningIdx = 0;
        let len:number = 0;
        let count = 0;
        let mask:number[] = [];
        let msg:null|Buffer = null;
        this.socket.on('data', (buffer) => {
            let byteIdx = 0;
            while (byteIdx < buffer.length) {
                if (len === 0) {
                    let byte = buffer.readUInt8(byteIdx++);
                    const fin = (byte & 0x80) >> 7;
                    const res = (byte & 0x70) >> 4;
                    op = (byte & 0x0F) >> 0;

                    byte = buffer.readUInt8(byteIdx++);
                    const hasMask = (byte & 0x80) >> 7;
                    len = (byte & 0x7F) >> 0;

                    if (len === 126) {
                        len = buffer.readUInt16BE(byteIdx);
                        byteIdx += 2;
                    } else if (len === 127) {
                        len = Number(buffer.readBigUInt64BE(byteIdx));
                        byteIdx += 8;
                    }
                    msg = Buffer.alloc(len);

                    mask = [
                        buffer.readUInt8(byteIdx++),
                        buffer.readUInt8(byteIdx++),
                        buffer.readUInt8(byteIdx++),
                        buffer.readUInt8(byteIdx++),
                    ];
                }

                const end = typeof len === 'bigint'
                    ? buffer.length
                    : Math.min(buffer.length, byteIdx + len);

                buffer.subarray(byteIdx, end).forEach((byte, i) => {
                    msg?.writeUInt8(byte ^ mask[runningIdx % 4], i);
                    runningIdx++;
                    byteIdx++;
                });

                count += buffer.length;
                if (count >= len) {
                    this._onData(msg);

                    if (op === 0x1) {
                        this._onText(msg?.toString());
                    } else if (op === 0x8) {
                        let code = 0;
                        if ((msg?.length ?? 0) > 0) {
                            code = msg?.readUInt16BE() ?? 0;
                            log.verbose('WebSocket', `${code}: ` + this.closureCodeMsgs[code]);
                        }
                        
                        this._onClose(code);
                        if (!this._closing) {
                            this.write(Buffer.from([ 1001 ]), { op: 0x8 });
                            this._closing = true;
                        }
                        this.socket.end();
                    } else if (op === 0x9) {
                        this.write('', { op: 0xA });
                    } else if (op === 0xA) {
                        log.verbose('WebSocket', 'pong');
                    } else {
                        log.error('WebSocket', `${op}`);
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
            log.verbose('WebSocket', 'ping');
        }, 1000);
    }

    _getWebsocketAcceptValue(key:string) {
        return createHash("sha1")
            .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
            .digest("base64");
    }

    get socket() {
        return this._socket;
    }

    get _onOpen() {
        log.verbose('WebSocket', 'connection opened');
        return !!this._on['open'] ? this._on['open'] : () => {};
    }

    get _onText() {
        return !!this._on['text'] ? this._on['text'] : () => {};
    }

    get _onData() {
        return !!this._on['data'] ? this._on['data'] : () => {};
    }

    get _onClose() {
        log.verbose('WebSocket', 'connection closed');
        if (this._keepAliveInterval)
            clearInterval(this._keepAliveInterval);
        return !!this._on['close'] ? this._on['close'] : () => {};
    }

    get _onEnd() {
        log.verbose('WebSocket', 'connection ended');
        return !!this._on['end'] ? this._on['end'] : () => {};
    }

    get _onError() {
        return !!this._on['error'] ? this._on['error'] : (err:string) => { throw new Error(err); };
    }
};
