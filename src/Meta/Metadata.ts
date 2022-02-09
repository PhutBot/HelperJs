export type Metadata = Record<string, any>; 

// const metaPropName = '$';
const metaPropName = '__meta';
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
        let desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        if (!desc) {
            Object.defineProperty(target, metaPropName, {
                value: {},
                enumerable: false
            });
            desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        }
        
        if (typeof key === 'string') {
            desc!.value[key] = value;
        } else {
            desc!.value = Object.assign(desc!.value, key);
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
        let desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        if (!desc) {
            Object.defineProperty(target, metaPropName, {
                value: {},
                enumerable: false
            });
            desc = Object.getOwnPropertyDescriptor(target, metaPropName);
        }
        
        if (!!key) {
            return desc!.value[key];
        } else {
            return desc!.value;
        }
    }
}
