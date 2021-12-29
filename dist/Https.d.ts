import { EnvBackedValue } from './Env';
export interface RequestSettings {
    method?: string;
    hostname: string;
    port?: number;
    uri: string;
    query?: object;
    headers?: any;
    body?: string;
    protocol?: string;
}
export declare function request(settings: RequestSettings): Promise<unknown>;
export interface ServerSettings {
    hostname?: string | EnvBackedValue;
    port?: number | EnvBackedValue;
}
export declare class SimpleServer {
    readonly hostname: string;
    readonly port: number;
    private _running;
    private _errHandlers;
    private _handlers;
    private _sockets;
    private _server;
    constructor(settings?: ServerSettings);
    get running(): boolean;
    get address(): string;
    defineHandler(method: string, path: string, handler: Function): void;
    start(): void;
    stop(): void;
}
