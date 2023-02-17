/// <reference types="node" />
import { Socket } from 'net';
import { HttpRequest } from "./Request";
export declare class WebSocketConnection {
    id: number;
    _socket: Socket;
    _closing: boolean;
    _on: {
        [key: string]: null | Function;
    };
    _keepAliveInterval?: NodeJS.Timer;
    closureCodeMsgs: {
        [key: number]: string;
    };
    constructor(id: number, req: HttpRequest, socket: Socket);
    on(eventType: string, handler: Function): this;
    write(msg: string | Buffer, options?: {
        op?: number;
    }): void;
    ping(): void;
    close(): void;
    _connect(req: HttpRequest): void;
    _getWebsocketAcceptValue(key: string): string;
    get socket(): Socket;
    get _onOpen(): Function;
    get _onText(): Function;
    get _onData(): Function;
    get _onClose(): Function;
    get _onEnd(): Function;
    get _onError(): Function;
}
