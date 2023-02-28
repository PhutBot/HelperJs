import { HttpRequest } from "../Request.js";
import { ErrorHttp } from "./Error.js";

export class ErrorHttp500Internal extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 500, 'Internal server error', msg);
    }
}
