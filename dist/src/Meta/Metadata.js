// const metaPropName = '$';
const metaPropName = '__meta';
export function defineMetadata(target, key, value) {
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
        let desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        if (!desc) {
            Object.defineProperty(target, metaPropName, {
                value: {},
                enumerable: false
            });
            desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        }
        if (typeof key === 'string') {
            desc.value[key] = value;
        }
        else {
            desc.value = Object.assign(desc.value, key);
        }
    }
}
export function getMetadata(target, key) {
    var _a;
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
        let desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        if (!desc) {
            Object.defineProperty(target, metaPropName, {
                value: {},
                enumerable: false
            });
            desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        }
        if (!!key) {
            return desc.value[key];
        }
        else {
            return desc.value;
        }
    }
}
//# sourceMappingURL=Metadata.js.map