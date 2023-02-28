import { HttpRequest } from "../Request.js";
export declare class ErrorHttp extends Error {
    readonly statusCode: number;
    readonly description: string;
    readonly request: HttpRequest;
    constructor(request: HttpRequest, statusCode: number, description: string, msg?: string);
}
//# sourceMappingURL=Error.d.ts.map