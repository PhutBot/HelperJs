/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Socket } from 'net';
import { Logger } from "../Log.js";
import { HttpRequest } from "./Request.js";
export declare enum WebsocketOpcode {
    CONTINUE = 0,
    TEXT = 1,
    BINARY = 2,
    CLOSE = 8,
    PING = 9,
    PONG = 10
}
export declare class WebSocketBase {
    protected _protocol?: string;
    protected _socket: Socket;
    protected _closing: boolean;
    protected _on: {
        [key: string]: null | Function;
    };
    protected _keepAliveInterval?: NodeJS.Timeout;
    protected logger: Logger;
    private writeMask;
    protected closureCodeMsgs: {
        [key: number]: string;
    };
    constructor(socket: Socket, logger: Logger, writeMask: boolean);
    on(eventType: string, handler: Function): this;
    write(opcode: WebsocketOpcode, msg?: string | Buffer): void;
    protected ping(): void;
    protected pong(): void;
    close(): void;
    get socket(): Socket;
    protected get _onOpen(): Function;
    protected get _onText(): Function;
    protected get _onData(): Function;
    protected get _onClose(): Function;
    protected get _onEnd(): Function;
    protected get _onError(): Function;
}
export declare class WebSocketConnection extends WebSocketBase {
    id: number;
    constructor(id: number, req: HttpRequest, socket: Socket, protocol?: string);
    private _connect;
    _getWebsocketAcceptValue(key: string): string;
}
export declare class WebSocketClient extends WebSocketBase {
    address: URL;
    constructor(address: string, protocol?: string);
    private _connect;
    private handleData;
}
//# sourceMappingURL=WebSocket.d.ts.map