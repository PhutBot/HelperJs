/// <reference types="node" />
import * as http from 'http';
import { EnvBackedValue } from '../Env';
import { RequestMethod, Headers, HttpRequest } from './Request';
import { PathMatcher } from './PathMatcher';
interface HandlerRecord {
    matcher: PathMatcher;
    handler: RequestHandler;
}
export interface HandlerResponse {
    statusCode: number;
    headers?: Headers;
    body?: string | Buffer;
}
export declare type RequestHandler = (request: HttpRequest, model?: {}) => Promise<HandlerResponse>;
export declare type HandlerMap = Record<RequestMethod, Record<string, HandlerRecord>>;
export declare type PreProcessor = (model: {} | Function | undefined, view: string) => string;
export interface ServerSettings {
    hostname?: string | EnvBackedValue;
    port?: number | EnvBackedValue;
    useCache?: boolean | EnvBackedValue;
    loglevel?: string;
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
    private handlers;
    private _running;
    private preprocessor;
    get running(): boolean;
    get address(): string;
    constructor(settings?: ServerSettings);
    addEventListener(eventName: string, handler: Function): void;
    mapDirectory(dirName: string, options?: {
        alias?: string;
        force?: boolean;
        cache?: boolean;
        model?: {};
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
        pathParams: import("./PathMatcher").PathParams;
    };
    _rootHandler(req: http.IncomingMessage, res: http.ServerResponse): void;
}
export {};
