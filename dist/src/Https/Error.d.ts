export declare class HttpError extends Error {
    readonly statusCode: number;
    readonly description: string;
    constructor(statusCode: number, description: string, msg?: string);
}
export declare class BadRequestError extends HttpError {
    readonly request: any;
    constructor(request: any, msg?: string);
}
export declare class PageNotFoundError extends HttpError {
    readonly url: URL;
    constructor(url: URL, msg?: string);
}
export declare class InternalServerError extends HttpError {
    constructor(msg?: string);
}
