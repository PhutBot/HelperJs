"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMapping = void 0;
const Request_1 = require("../Request");
class BaseHandler {
    constructor() {
        this.location = '/';
        this.method = Request_1.RequestMethod.GET;
    }
}
function RequestMapping(mapping) {
    var _a, _b;
    mapping.location = (_a = mapping.location) !== null && _a !== void 0 ? _a : '/';
    mapping.method = (_b = mapping.method) !== null && _b !== void 0 ? _b : Request_1.RequestMethod.GET;
    return (target, key, desc) => {
        if (!!key && !!desc) {
            if (desc.value.apply(null) instanceof Promise) {
                desc.value.__decorators = desc.value.__decorators || {};
                desc.value.__decorators['requestMapping'] = mapping;
            }
            else {
                throw `${desc.value.name} - functions with the '@requestMapping' decorator must be async or return a Promise`;
            }
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
exports.RequestMapping = RequestMapping;
//# sourceMappingURL=index.js.map