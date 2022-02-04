export type Metadata = Record<string, any>; 

export function defineMetadata(target:any, key:string|Metadata, value?:object) {
    target.__meta = target.__meta || {};
    if (typeof key === 'string') {
        target.__meta[key as string] = value;
    } else {
        target.__meta = Object.assign(target.__meta, key);
    }
}

export function getMetadata(target:any, key?:string) {
    if (!!key) {
        return target?.__meta?.[key];
    } else {
        return target?.__meta;
    }
}
