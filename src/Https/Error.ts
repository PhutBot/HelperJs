export class HttpError extends Error {
    readonly statusCode:number;
    readonly description:string;

    constructor(statusCode:number, description:string, msg?:string) {
        super(msg ?? description);
        this.description = description;
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends HttpError {
    readonly request:any;
    
    constructor(request:any, msg?:string) {
        super(400, 'bad request', msg);
        this.request = request;
    }
}

export class PageNotFoundError extends HttpError {
    readonly url:URL;

    constructor(url:URL, msg?:string) {
        super(404, `page not found (${url.pathname})`, msg);
        this.url = url;
    }
}

export class InternalServerError extends HttpError {
    constructor(msg?:string) {
        super(500, 'internal server error', msg);
    }
}
