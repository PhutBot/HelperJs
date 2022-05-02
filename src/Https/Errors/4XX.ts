import { HttpRequest } from "../Request";
import { ErrorHttp } from "./Error";

export class ErrorHttp400BadRequest extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 400, 'bad request', msg);
    }
}

export class ErrorHttp401Unauthorized extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 401, 'Unauthorized', msg);
    }
}

export class ErrorHttp403Forbidden extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 403, 'Forbidden', msg);
    }
}

export class ErrorHttp404NotFound extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 404, `page not found (${request.url.pathname})`, msg);
    }
}

export class ErrorHttp405Method extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 405, 'Method not allowed', msg);
    }
}

export class ErrorHttp418Teapot extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 418, "I'm a teapot", msg);
    }
}
