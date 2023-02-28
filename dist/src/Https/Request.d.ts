/// <reference types="node" />
/// <reference types="node" />
import * as net from 'net';
import { PathParams } from "./PathMatcher.js";
export declare enum RequestProtocol {
    HTTP = "HTTP",
    HTTPS = "HTTPS"
}
export declare enum RequestMethod {
    DELETE = "DELETE",
    GET = "GET",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT"
}
export declare const RequestMethodsAllowingBody: RequestMethod[];
export type Headers = Record<string, string[]>;
export type QueryParams = Record<string, string[]>;
export interface RequestSettings {
    protocol?: RequestProtocol | string;
    method?: RequestMethod | string;
    hostname: string;
    port?: number;
    uri: string;
    query?: QueryParams;
    headers?: Headers;
    body?: string;
    timeout?: number;
}
export declare class Body {
    private data;
    constructor(data: Buffer);
    raw(): Promise<Buffer>;
    text(): Promise<string>;
    json(): Promise<any>;
}
export interface HttpRequest {
    socket: net.Socket;
    method: RequestMethod;
    url: URL;
    path: string;
    filePath?: string;
    pathParams: PathParams;
    queryParams: QueryParams;
    headers: Headers;
    body?: () => Promise<Body>;
}
export interface HttpResponse {
    statusCode: number;
    headers?: Headers;
    body: () => Promise<Body>;
}
export declare function request(settings: RequestSettings): Promise<HttpResponse>;
//# sourceMappingURL=Request.d.ts.map