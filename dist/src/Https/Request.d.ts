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
