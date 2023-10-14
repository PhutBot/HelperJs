import { DecoratorBuilder } from "../../Meta/DecoratorBuilder.js";
import { RequestMethod } from "../Request.js";

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

export function Controller<T>(path?: string) {
    return RequestMapping({ location: path });
}

export function Get(path?: string) {
    return RequestMapping({ method: RequestMethod.GET, location: path ?? "/" });
}

export function Put(path?: string) {
    return RequestMapping({ method: RequestMethod.PUT, location: path ?? "/" });
}

export function Post(path?: string) {
    return RequestMapping({ method: RequestMethod.POST, location: path ?? "/" });
}

export function Delete(path?: string) {
    return RequestMapping({ method: RequestMethod.DELETE, location: path ?? "/" });
}