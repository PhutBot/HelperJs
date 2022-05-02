import { HttpRequest } from "../Request";
import { ErrorHttp } from "./Error";

export class ErrorHttp500Internal extends ErrorHttp {
    constructor(request:HttpRequest, msg?:string) {
        super(request, 500, 'Internal server error', msg);
    }
}
