/// <reference types="node" />
import * as http from 'http';
import { EnvBackedValue } from '../Env';
import { RequestMethod } from './Request';
import { PathParams, PathMatcher } from './PathMatcher';
interface HandlerRecord {
    matcher: PathMatcher;
    handler: RequestHandler;
}
export declare class Body {
    private data;
    constructor(data: string);
    text(): Promise<string>;
    json(): Promise<any>;
}
export declare type Headers = Record<string, string[]>;
export declare type QueryParams = Record<string, string[]>;
export interface HttpRequest {
    method: RequestMethod;
    url: URL;
    path: string;
    pathParams: PathParams;
    queryParams: QueryParams;
    headers: Headers;
    body: () => Promise<Body>;
}
export interface HttpResponse {
    statusCode: number;
    headers?: Headers;
    body?: string;
}
export declare type RequestHandler = (request: HttpRequest) => Promise<HttpResponse>;
export declare type HandlerMap = Record<RequestMethod, Record<string, HandlerRecord>>;
export interface ServerSettings {
    hostname?: string | EnvBackedValue;
    port?: number | EnvBackedValue;
    useCache?: boolean | EnvBackedValue;
}
export declare class SimpleServer {
    readonly hostname: string;
    readonly port: number;
    readonly useCache: boolean;
    private alias2Dir;
    private dir2Alias;
    private cachedFiles;
    private server;
    private sockets;
    private handlers;
    private errorHandlers;
    private _running;
    get running(): boolean;
    get address(): string;
    constructor(settings?: ServerSettings);
    mapDirectory(dirName: string, options?: {
        alias?: string;
        force?: boolean;
        cache?: boolean;
    }): void;
    unmapDirectory(alias: string): void;
    mapHandler(clazz: Function): void;
    unmapHandler(clazz: Function): void;
    defineHandler(method: string | RequestMethod, path: string, handler: RequestHandler, options?: {
        force?: boolean;
    }): void;
    removeHandler(method: string | RequestMethod, path: string): void;
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
    _getHandler(method: RequestMethod, url: URL): {
        handler: RequestHandler;
        pathParams: PathParams;
    };
    _rootHandler(req: http.IncomingMessage, res: http.ServerResponse): void;
}
export {};
