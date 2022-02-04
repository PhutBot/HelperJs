"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadata = exports.defineMetadata = void 0;
function defineMetadata(target, key, value) {
    target.__meta = target.__meta || {};
    if (typeof key === 'string') {
        target.__meta[key] = value;
    }
    else {
        target.__meta = Object.assign(target.__meta, key);
    }
}
exports.defineMetadata = defineMetadata;
function getMetadata(target, key) {
    var _a;
    if (!!key) {
        return (_a = target === null || target === void 0 ? void 0 : target.__meta) === null || _a === void 0 ? void 0 : _a[key];
    }
    else {
        return target === null || target === void 0 ? void 0 : target.__meta;
    }
}
exports.getMetadata = getMetadata;
//# sourceMappingURL=Metadata.js.map