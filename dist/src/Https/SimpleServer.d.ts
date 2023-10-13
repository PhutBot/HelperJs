/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import { EnvBackedValue } from "../Env.js";
import { RequestMethod, Headers, HttpRequest } from "./Request.js";
import { PathMatcher } from "./PathMatcher.js";
import { LogLevel } from "../Log.js";
import { Middleware } from "./Middleware.js";
import { WebSocketConnection } from "./WebSocket.js";
interface HandlerRecord {
    matcher: PathMatcher;
    handler: RequestHandler;
}
export interface HandlerResponse {
    statusCode: number;
    headers?: Headers;
    body?: string | Buffer;
    model?: any;
}
export type RequestHandler = (request: HttpRequest, model?: {}) => Promise<HandlerResponse>;
export type HandlerMap = Record<RequestMethod, Record<string, HandlerRecord>>;
export type PreProcessor = (model: {} | Function | undefined, view: string) => string;
export interface ServerSettings {
    hostname?: string | EnvBackedValue;
    port?: number | EnvBackedValue;
    useCache?: boolean | EnvBackedValue;
    loglevel?: LogLevel;
    preprocessor?: PreProcessor;
}
export declare class SimpleServer {
    readonly hostname: string;
    readonly port: number;
    readonly useCache: boolean;
    private alias2Dir;
    private dir2Alias;
    private cachedFiles;
    private eventEmitter;
    private logger;
    private server;
    private sockets;
    websockets: Array<WebSocketConnection>;
    private handlers;
    private _running;
    private middlewares;
    private preprocessor;
    get running(): boolean;
    get address(): string;
    constructor(settings?: ServerSettings);
    addMiddleware(middleware: Middleware): void;
    addEventListener(eventName: string, handler: Function): void;
    mapDirectory(dirName: string, options?: {
        alias?: string;
        force?: boolean;
        cache?: boolean;
        model?: any;
    }): void;
    unmapDirectory(alias: string): void;
    mapHandler(target: Function): void;
    unmapHandler(target: Function): void;
    defineHandler(method: string | RequestMethod, path: string, handler: RequestHandler, options?: {
        force?: boolean;
    }): void;
    removeHandler(method: string | RequestMethod, path: string): void;
    removeAllHandlers(): void;
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
    _getHandler(m: string | RequestMethod, url: URL): {
        handler: RequestHandler;
        pathParams: import("./PathMatcher.js").PathParams;
    };
    _translateRequest(req: http.IncomingMessage): HttpRequest;
    _rootHandler(req: http.IncomingMessage, res: http.ServerResponse): void;
}
export {};
//# sourceMappingURL=SimpleServer.d.ts.map