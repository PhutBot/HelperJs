"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadata = exports.defineMetadata = void 0;
// const metaPropName = '$';
// const metaPropName = '__meta';
function defineMetadata(target, key, value) {
    if (typeof target !== 'function' && typeof target !== 'object')
        return;
    if ('prototype' in target) {
        target.prototype.__meta = target.prototype.__meta || {};
        if (typeof key === 'string') {
            target.prototype.__meta[key] = value;
        }
        else {
            target.prototype.__meta = Object.assign(target.prototype.__meta, key);
        }
    }
    else {
        const target1 = target;
        target1.__meta = target1.__meta || {};
        if (typeof key === 'string') {
            target1.__meta[key] = value;
        }
        else {
            target1.__meta = Object.assign(target1.__meta, key);
        }
    }
}
exports.defineMetadata = defineMetadata;
function getMetadata(target, key) {
    var _a, _b;
    if (typeof target !== 'function' && typeof target !== 'object')
        return;
    if ('prototype' in target) {
        if (!!key) {
            return (_a = target === null || target === void 0 ? void 0 : target.prototype.__meta) === null || _a === void 0 ? void 0 : _a[key];
        }
        else {
            return target === null || target === void 0 ? void 0 : target.prototype.__meta;
        }
    }
    else {
        const target1 = target;
        if (!!key) {
            return (_b = target1 === null || target1 === void 0 ? void 0 : target1.__meta) === null || _b === void 0 ? void 0 : _b[key];
        }
        else {
            return target1 === null || target1 === void 0 ? void 0 : target1.__meta;
        }
    }
}
exports.getMetadata = getMetadata;
//# sourceMappingURL=Metadata.js.map