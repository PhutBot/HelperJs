import { HttpRequest } from "../Request.js";

export class ErrorHttp extends Error {
    readonly statusCode:number;
    readonly description:string;
    readonly request:HttpRequest;

    constructor(request:HttpRequest, statusCode:number, description:string, msg?:string) {
        super(msg ?? description);
        this.description = description;
        this.statusCode = statusCode;
        this.request = request;
    }
}
