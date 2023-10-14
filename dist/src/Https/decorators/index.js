import { DecoratorBuilder } from "../../Meta/DecoratorBuilder.js";
import { RequestMethod } from "../Request.js";
export function RequestMapping(mapping) {
    var _a, _b;
    mapping.method = (_a = mapping.method) !== null && _a !== void 0 ? _a : RequestMethod.GET;
    mapping.location = (_b = mapping.location) !== null && _b !== void 0 ? _b : '/';
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
export function Controller(path) {
    return RequestMapping({ location: path });
}
export function Get(path) {
    return RequestMapping({ method: RequestMethod.GET, location: path !== null && path !== void 0 ? path : "/" });
}
export function Put(path) {
    return RequestMapping({ method: RequestMethod.PUT, location: path !== null && path !== void 0 ? path : "/" });
}
export function Post(path) {
    return RequestMapping({ method: RequestMethod.POST, location: path !== null && path !== void 0 ? path : "/" });
}
export function Delete(path) {
    return RequestMapping({ method: RequestMethod.DELETE, location: path !== null && path !== void 0 ? path : "/" });
}
//# sourceMappingURL=index.js.map