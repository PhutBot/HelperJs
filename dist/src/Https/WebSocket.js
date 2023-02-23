"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = exports.WebSocketConnection = exports.WebSocketBase = exports.WebsocketOpcode = void 0;
const crypto_1 = require("crypto");
const net_1 = require("net");
const Log_1 = require("../Log");
var WebsocketOpcode;
(function (WebsocketOpcode) {
    WebsocketOpcode[WebsocketOpcode["CONTINUE"] = 0] = "CONTINUE";
    WebsocketOpcode[WebsocketOpcode["TEXT"] = 1] = "TEXT";
    WebsocketOpcode[WebsocketOpcode["BINARY"] = 2] = "BINARY";
    WebsocketOpcode[WebsocketOpcode["CLOSE"] = 8] = "CLOSE";
    WebsocketOpcode[WebsocketOpcode["PING"] = 9] = "PING";
    WebsocketOpcode[WebsocketOpcode["PONG"] = 10] = "PONG";
})(WebsocketOpcode = exports.WebsocketOpcode || (exports.WebsocketOpcode = {}));
;
class WebSocketBase {
    constructor(socket, subclass) {
        this._closing = false;
        this._on = {};
        this.closureCodeMsgs = {
            0: 'unknown',
            1000: 'indicates a normal closure, meaning that the purpose for which the connection was established has been fulfilled.',
            1001: 'indicates that an endpoint is "going away", such as a server going down or a browser having navigated away from a page.',
            1002: 'indicates that an endpoint is terminating the connection due to a protocol error.',
            1003: 'indicates that an endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).',
        };
        this.subclass = subclass;
        this._socket = socket;
        this._on = {
            open: null,
            text: null,
            data: null,
            close: null,
            end: null,
            error: null
        };
    }
    on(eventType, handler) {
        if (eventType in this._on)
            this._on[eventType] = handler;
        return this;
    }
    write(opcode, msg) {
        var _a, _b, _c;
        const fin = 1;
        const res = 0;
        const op = opcode !== null && opcode !== void 0 ? opcode : WebsocketOpcode.CONTINUE;
        let byte1 = ((fin & 0x1) << 7) | ((res & 0x7) << 4) | (op & 0xF);
        const hasMask = 0;
        let lenEx = 0;
        let lenExSize = 0;
        let len = (_a = msg === null || msg === void 0 ? void 0 : msg.length) !== null && _a !== void 0 ? _a : 0;
        if (len >= 0x7E && len <= 0xFFFF) {
            lenEx = len;
            lenExSize = 2;
            len = 126;
        }
        else if (len > 0xFFFF) {
            lenEx = len;
            lenExSize = 8;
            len = 127;
        }
        let byte2 = ((hasMask & 0x1) << 7) | (len & 0x7F);
        const buffer = Buffer.alloc(2 + lenExSize + ((_b = msg === null || msg === void 0 ? void 0 : msg.length) !== null && _b !== void 0 ? _b : 0));
        buffer.writeUInt8(byte1, 0);
        buffer.writeUInt8(byte2, 1);
        if (lenExSize === 2) {
            buffer.writeUInt16BE(lenEx, 2);
        }
        else if (lenExSize === 8) {
            buffer.writeBigUInt64BE(BigInt(lenEx), 2);
        }
        buffer.write((_c = msg === null || msg === void 0 ? void 0 : msg.toString()) !== null && _c !== void 0 ? _c : '', 2 + lenEx, 'utf-8');
        this.socket.write(buffer);
    }
    ping() {
        this.write(WebsocketOpcode.PING);
    }
    pong() {
        this.write(WebsocketOpcode.PONG);
    }
    close() {
        this._closing = true;
        this.write(WebsocketOpcode.CLOSE);
        this.socket.end();
        this._onClose(1000);
    }
    get socket() {
        return this._socket;
    }
    get _onOpen() {
        Log_1.DefaultLogger.verbose(this.subclass, 'connection opened');
        return !!this._on['open'] ? this._on['open'] : () => { };
    }
    get _onText() {
        return !!this._on['text'] ? this._on['text'] : () => { };
    }
    get _onData() {
        return !!this._on['data'] ? this._on['data'] : () => { };
    }
    get _onClose() {
        Log_1.DefaultLogger.verbose(this.subclass, 'connection closed');
        if (this._keepAliveInterval)
            clearInterval(this._keepAliveInterval);
        return !!this._on['close'] ? this._on['close'] : () => { };
    }
    get _onEnd() {
        Log_1.DefaultLogger.verbose(this.subclass, 'connection ended');
        return !!this._on['end'] ? this._on['end'] : () => { };
    }
    get _onError() {
        return !!this._on['error'] ? this._on['error'] : (err) => { throw new Error(err); };
    }
}
exports.WebSocketBase = WebSocketBase;
;
class WebSocketConnection extends WebSocketBase {
    constructor(id, req, socket, protocol) {
        super(socket, 'WebSocketConnection');
        this.id = -1;
        this._protocol = protocol;
        this.id = id;
        this._connect(req);
    }
    _connect(req) {
        let op = null;
        let runningIdx = 0;
        let len = 0;
        let count = 0;
        let mask = [];
        let msg = null;
        let hasMask = false;
        this.socket.on('data', (buffer) => {
            var _a, _b;
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
                    }
                    else if (len === 127) {
                        len = Number(buffer.readBigUInt64BE(byteIdx));
                        byteIdx += 8;
                    }
                    msg = Buffer.alloc(len);
                    if (hasMask)
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
                    if (hasMask)
                        msg === null || msg === void 0 ? void 0 : msg.writeUInt8(byte ^ mask[runningIdx % 4], i);
                    else
                        msg === null || msg === void 0 ? void 0 : msg.writeUInt8(byte, i);
                    runningIdx++;
                    byteIdx++;
                });
                count += buffer.length;
                if (count >= len) {
                    if (op === WebsocketOpcode.TEXT) {
                        this._onText(msg === null || msg === void 0 ? void 0 : msg.toString());
                    }
                    else if (op === WebsocketOpcode.BINARY) {
                        this._onData(msg);
                    }
                    else if (op === WebsocketOpcode.CLOSE) {
                        let code = 0;
                        if (((_a = msg === null || msg === void 0 ? void 0 : msg.length) !== null && _a !== void 0 ? _a : 0) > 0) {
                            code = (_b = msg === null || msg === void 0 ? void 0 : msg.readUInt16BE()) !== null && _b !== void 0 ? _b : 0;
                            Log_1.DefaultLogger.verbose('WebSocketConnection', `${code}: ` + this.closureCodeMsgs[code]);
                        }
                        this._onClose(code);
                        if (!this._closing) {
                            this.write(WebsocketOpcode.CLOSE, Buffer.from([1001]));
                            this._closing = true;
                        }
                        this.socket.end();
                    }
                    else if (op === WebsocketOpcode.PING) {
                        Log_1.DefaultLogger.verbose('WebSocketConnection', 'ping');
                        this.write(WebsocketOpcode.PONG);
                    }
                    else if (op === WebsocketOpcode.PONG) {
                        Log_1.DefaultLogger.verbose('WebSocketConnection', 'pong');
                    }
                    else {
                        Log_1.DefaultLogger.error('WebSocketConnection', `${op}`);
                        throw new Error(`op, ${msg === null || msg === void 0 ? void 0 : msg.toString()}`);
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
            Log_1.DefaultLogger.verbose('WebSocketConnection', 'ping');
        }, 1000);
    }
    _getWebsocketAcceptValue(key) {
        return (0, crypto_1.createHash)("sha1")
            .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
            .digest("base64");
    }
}
exports.WebSocketConnection = WebSocketConnection;
;
class WebSocketClient extends WebSocketBase {
    constructor(address, protocol) {
        super(new net_1.Socket({ allowHalfOpen: true, readable: true, writable: true }), 'WebSocketClient');
        this._protocol = protocol;
        this.address = new URL(address);
        this._connect();
    }
    _connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.socket.once('data', (buffer) => {
                let op = null;
                let runningIdx = 0;
                let len = 0;
                let count = 0;
                let mask = [];
                let msg = null;
                // DefaultLogger.info(buffer.toString());
                this.socket.on('data', (buffer) => {
                    var _a, _b;
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
                            if (len !== 0) {
                                if (len === 126) {
                                    len = buffer.readUInt16BE(byteIdx);
                                    byteIdx += 2;
                                }
                                else if (len === 127) {
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
                        }
                        const end = typeof len === 'bigint'
                            ? buffer.length
                            : Math.min(buffer.length, byteIdx + len);
                        buffer.subarray(byteIdx, end).forEach((byte, i) => {
                            msg === null || msg === void 0 ? void 0 : msg.writeUInt8(byte ^ mask[runningIdx % 4], i);
                            runningIdx++;
                            byteIdx++;
                        });
                        count += buffer.length;
                        if (count >= len) {
                            if (op === WebsocketOpcode.TEXT) {
                                this._onText(msg === null || msg === void 0 ? void 0 : msg.toString());
                            }
                            else if (op === WebsocketOpcode.BINARY) {
                                this._onData(msg);
                            }
                            else if (op === WebsocketOpcode.CLOSE) {
                                let code = 0;
                                if (((_a = msg === null || msg === void 0 ? void 0 : msg.length) !== null && _a !== void 0 ? _a : 0) > 0) {
                                    code = (_b = msg === null || msg === void 0 ? void 0 : msg.readUInt16BE()) !== null && _b !== void 0 ? _b : 0;
                                    Log_1.DefaultLogger.verbose('WebSocketClient', `${code}: ` + this.closureCodeMsgs[code]);
                                }
                                this._onClose(code);
                                if (!this._closing) {
                                    this.write(WebsocketOpcode.CLOSE, Buffer.from([1001]));
                                    this._closing = true;
                                }
                                this.socket.end();
                            }
                            else if (op === WebsocketOpcode.PING) {
                                Log_1.DefaultLogger.verbose('WebSocketClient', 'ping');
                                this.write(WebsocketOpcode.PONG);
                            }
                            else if (op === WebsocketOpcode.PONG) {
                                Log_1.DefaultLogger.verbose('WebSocketClient', 'pong');
                            }
                            else {
                                Log_1.DefaultLogger.error('WebSocketClient', `${op}`);
                                throw new Error(`op, ${msg === null || msg === void 0 ? void 0 : msg.toString()}`);
                            }
                            len = 0;
                            mask = [];
                            runningIdx = 0;
                            op = null;
                            msg = null;
                        }
                    }
                });
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
        });
    }
}
exports.WebSocketClient = WebSocketClient;
;
//# sourceMappingURL=WebSocket.js.map