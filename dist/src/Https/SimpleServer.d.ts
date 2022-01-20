/// <reference types="node" />
import * as http from 'http';
import { EnvBackedValue } from '../Env';
import { RequestMethod } from './Request';
import { HttpError } from './Error';
import { PathMatcher } from './PathMatcher';
interface RequestOptions {
    url: URL;
    argMap?: {};
    err?: HttpError;
}
interface HandlerRecord {
    matcher: PathMatcher;
    handler: RequestHandler;
}
export declare type RequestHandler = (req: http.IncomingMessage, res: http.ServerResponse, options: RequestOptions) => void;
export declare type HandlerMap = Record<string | RequestMethod, Record<string, HandlerRecord>>;
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
    defineHandler(method: string | RequestMethod, path: string, handler: RequestHandler, options?: {
        force?: boolean;
    }): void;
    removeHandler(method: string | RequestMethod, path: string): void;
    start(): void;
    stop(): void;
    _getHandler(method: string | RequestMethod, url: URL): {
        handler: RequestHandler;
        options: {
            url: URL;
            vars: {};
        };
    };
    _handleError(url: URL, req: http.IncomingMessage, res: http.ServerResponse, err: HttpError): void;
}
export {};
