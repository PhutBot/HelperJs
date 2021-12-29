/// <reference types="node" />
import * as http from 'http';
import { EnvBackedValue } from './Env';
export declare enum RequestProtocol {
    HTTP = "HTTP",
    HTTPS = "HTTPS"
}
export declare enum RequestMethod {
    GET = "GET",
    POST = "POST",
    ERROR = "ERROR"
}
export interface RequestSettings {
    protocol?: RequestProtocol;
    method?: RequestMethod;
    hostname: string;
    port?: number;
    uri: string;
    query?: object;
    headers?: any;
    body?: string;
}
export declare function request(settings: RequestSettings): Promise<unknown>;
export interface ServerSettings {
    hostname?: string | EnvBackedValue;
    port?: number | EnvBackedValue;
}
export declare type RequestHandler = (url: URL, req: http.IncomingMessage, res: http.ServerResponse) => void;
export declare class SimpleServer {
    readonly hostname: string;
    readonly port: number;
    private _server;
    private _running;
    private _sockets;
    private _handlers;
    constructor(settings?: ServerSettings);
    get running(): boolean;
    get address(): string;
    defineErrHandler(code: number, handler: RequestHandler): void;
    defineHandler(method: RequestMethod, path: string, handler: RequestHandler): void;
    start(): void;
    stop(): void;
}
