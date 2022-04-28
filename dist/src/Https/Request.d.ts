/// <reference types="node" />
import * as net from 'net';
import { PathParams } from './PathMatcher';
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
export interface RequestSettings {
    protocol?: RequestProtocol | string;
    method?: RequestMethod | string;
    hostname: string;
    port?: number;
    uri: string;
    query?: object;
    headers?: any;
    body?: string;
}
export declare type Headers = Record<string, string[]>;
export declare type QueryParams = Record<string, string[]>;
export declare class Body {
    private data;
    constructor(data: string);
    text(): Promise<string>;
    json(): Promise<any>;
}
export interface HttpRequest {
    socket: net.Socket;
    method: RequestMethod;
    url: URL;
    path: string;
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
