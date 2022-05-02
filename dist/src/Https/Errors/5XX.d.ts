import { HttpRequest } from "../Request";
import { ErrorHttp } from "./Error";
export declare class ErrorHttp500Internal extends ErrorHttp {
    constructor(request: HttpRequest, msg?: string);
}
