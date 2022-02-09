export type Metadata = Record<string, any>; 

// const metaPropName = '$';
// const metaPropName = '__meta';
export function defineMetadata(target:object|Function, key:string|Metadata, value?:any) {
    if (typeof target !== 'function' && typeof target !== 'object')
        return;

    if ('prototype' in target) {
        target.prototype.__meta = target.prototype.__meta || {};
        if (typeof key === 'string') {
            target.prototype.__meta[key as string] = value;
        } else {
            target.prototype.__meta = Object.assign(target.prototype.__meta, key);
        }
    } else {
        const target1 = target as {__meta:any};
        target1.__meta = target1.__meta || {};
        if (typeof key === 'string') {
            target1.__meta[key as string] = value;
        } else {
            target1.__meta = Object.assign(target1.__meta, key);
        }
    }
}

export function getMetadata(target:object|Function, key?:string) {
    if (typeof target !== 'function' && typeof target !== 'object')
        return;

    if ('prototype' in target) {
        if (!!key) {
            return target?.prototype.__meta?.[key];
        } else {
            return target?.prototype.__meta;
        }
    } else {
        const target1 = target as {__meta?:any};
        if (!!key) {
            return target1?.__meta?.[key];
        } else {
            return target1?.__meta;
        }
    }
}
