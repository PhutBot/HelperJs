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
    hostname?: string;
    port?: number;
}
export declare class SimpleServer {
    private _running;
    private _settings;
    private _errHandlers;
    private _handlers;
    private _sockets;
    private _server;
    constructor(settings?: ServerSettings);
    get running(): boolean;
    get port(): number | undefined;
    get hostname(): string | undefined;
    get address(): string;
    defineHandler(method: string, path: string, handler: Function): void;
    start(): void;
    stop(): void;
}
