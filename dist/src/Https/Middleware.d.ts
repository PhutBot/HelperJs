import { HandlerResponse } from "./SimpleServer";
export declare enum MiddlewareStage {
    PRE_PROCESSOR = "PRE_PROCESSOR",
    POST_PROCESSOR = "POST_PROCESSOR"
}
export declare abstract class Middleware {
    abstract get stage(): MiddlewareStage;
    abstract process(model: {}, response?: HandlerResponse): void;
}