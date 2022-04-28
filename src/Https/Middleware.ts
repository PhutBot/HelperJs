import { HttpRequest } from "./Request";
import { HandlerResponse } from "./SimpleServer";

export enum MiddlewareStage {
    PRE_PROCESSOR = 'PRE_PROCESSOR',
    POST_PROCESSOR = 'POST_PROCESSOR'
}

export abstract class Middleware {
    abstract get stage(): MiddlewareStage;
    abstract process(model:{}, response?:HandlerResponse):void;
}