import { HttpRequest } from "../Request";
import { ErrorHttp } from "./Error";
export declare class ErrorHttp400BadRequest extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp401Unauthorized extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp403Forbidden extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp404NotFound extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp405Method extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp418Teapot extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
