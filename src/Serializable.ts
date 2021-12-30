export function get(item:string, json:any, type?:any) {
    if (!!json && item in json) {
        if (typeof type === 'function') {
            return new type(json[item]);
        } else {
            return json[item];
        }
    }
    return null;
}

export function getArray(item:string, json:any, type?:any) {
    const result = [];
    if (!!json && item in json && Array.isArray(json[item])) {
        const array = get(item, json);

        if (typeof type === 'function') {
            for (let i = 0; i < json[item].length; ++i)
                result.push(new type(array[i]));
        } else {
            for (let i = 0; i < json[item].length; ++i)
                result.push(array[i]);
        }
    }
    return result;
}

export function assign(target:any, src:any, item:string, type?:any) {
    target[`_${item}`] = get(item, src, type)
}


export function assignArray(target:any, src:any, item:string, type?:any) {
    target[`_${item}`] = getArray(item, src, type)
}
