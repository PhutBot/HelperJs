import { DecoratorBuilder } from "../../Meta/DecoratorBuilder.js";
import { RequestMethod } from "../Request.js";

class BaseHandler {
    readonly location:string;
    readonly method:RequestMethod;

    constructor() {
        this.location = '/';
        this.method = RequestMethod.GET;
    }
}

interface RequestMapping {
    method?:RequestMethod|string;
    location?:string;
}

export function RequestMapping(mapping:RequestMapping) {
    mapping.method = mapping.method as RequestMethod ?? RequestMethod.GET;
    mapping.location = mapping.location ?? '/';

    return new DecoratorBuilder()
        .onClass((constructor, meta) => {
            meta.location = mapping.location;
        })
        .onMethod((target, propertyKey, descriptor, meta) => {
            meta.method = mapping.method;
            meta.location = mapping.location;
            return null;
        })
        .build();
}
