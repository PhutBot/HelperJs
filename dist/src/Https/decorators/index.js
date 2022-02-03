"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMapping = void 0;
const Request_1 = require("../Request");
class BaseHandler {
    constructor() {
        this.location = '/';
        this.method = Request_1.RequestMethod.GET;
    }
}
function requestMapping(mapping) {
    var _a, _b;
    mapping.location = (_a = mapping.location) !== null && _a !== void 0 ? _a : '/';
    mapping.method = (_b = mapping.method) !== null && _b !== void 0 ? _b : Request_1.RequestMethod.GET;
    return (target, key, desc) => {
        if (!!key && !!desc) {
            desc.value.__decorators = desc.value.__decorators || {};
            desc.value.__decorators['requestMapping'] = mapping;
        }
        else if (typeof target === 'function') {
            delete mapping.method;
            target.__decorators = target.__decorators || {};
            target.__decorators['requestMapping'] = mapping;
            return target;
        }
        else {
            throw '@requestMapping error';
        }
    };
}
exports.requestMapping = requestMapping;
//# sourceMappingURL=index.js.map