import { HttpRequest } from "../Request.js";
import { ErrorHttp } from "./Error.js";
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
export declare class ErrorHttp409Conflict extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
export declare class ErrorHttp418Teapot extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
//# sourceMappingURL=4XX.d.ts.map