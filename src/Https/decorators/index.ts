import http from "http";
import { resolve } from "path/posix";
import { RequestMethod } from "../Request";

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

export function requestMapping(mapping:RequestMapping) {
    mapping.location = mapping.location ?? '/';
    mapping.method = mapping.method as RequestMethod ?? RequestMethod.GET;

    return (target:any, key?:string, desc?:TypedPropertyDescriptor<any>) => {
        if (!!key && !!desc) {
            desc.value.__decorators = desc.value.__decorators || {};
            desc.value.__decorators['requestMapping'] = mapping;
        } else if (typeof target === 'function') {
            delete mapping.method;
            target.__decorators = target.__decorators || {};
            target.__decorators['requestMapping'] = mapping;
            return target;
        } else {
            throw '@requestMapping error';
        }
    };
}
