"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMapping = void 0;
const DecoratorBuilder_1 = require("../../Meta/DecoratorBuilder");
const Request_1 = require("../Request");
class BaseHandler {
    constructor() {
        this.location = '/';
        this.method = Request_1.RequestMethod.GET;
    }
}
function RequestMapping(mapping) {
    var _a, _b;
    mapping.method = (_a = mapping.method) !== null && _a !== void 0 ? _a : Request_1.RequestMethod.GET;
    mapping.location = (_b = mapping.location) !== null && _b !== void 0 ? _b : '/';
    return new DecoratorBuilder_1.DecoratorBuilder()
        .onClass((constructor, meta) => {
        meta.location = mapping.location;
    })
        .onMethod((target, propertyKey, descriptor, meta) => {
        meta.method = mapping.method;
        meta.location = mapping.location;
    })
        .build();
}
exports.RequestMapping = RequestMapping;
//# sourceMappingURL=index.js.map