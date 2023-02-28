import { DecoratorBuilder } from "../../Meta/DecoratorBuilder.js";
import { RequestMethod } from "../Request.js";
class BaseHandler {
    constructor() {
        this.location = '/';
        this.method = RequestMethod.GET;
    }
}
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
//# sourceMappingURL=index.js.map