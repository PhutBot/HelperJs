function elapsedToStringHelper(elapsed:number, result:string, total:number, fmt:any, name:string, from:Function, to:Function, mul=1) {
    if (name in fmt) {
        const value = Math.max(fmt[name], Math.floor(to(elapsed - total)/mul));
        total += from(value*mul);
        if (value > 1) {
            name += 's';
        }
        if (value > 0) {
            if (!!result)
                result += ', ';
            result += `${value} ${name}`;
        }
    }
    return { result, total };
}

export function fromSec(time:number) { return time * 1000; }
export function fromMin(time:number) { return time * 60 * 1000; }
export function fromHrs(time:number) { return time * 60 * 60 * 1000; }
export function fromDay(time:number) { return time * 24 * 60 * 60 * 1000; }
export function fromYrs(time:number) { return time * 365 * 24 * 60 * 60 * 1000; }
export function toSec(time:number) { return Math.floor(time / 1000); }
export function toMin(time:number) { return Math.floor(time / 1000 / 60); }
export function toHrs(time:number) { return Math.floor(time / 1000 / 60 / 60); }
export function toDay(time:number) { return Math.floor(time / 1000 / 60 / 60 / 24); }
export function toYrs(time:number) { return Math.floor(time / 1000 / 60 / 60 / 24 / 365); }
export function inf(_:number) { return Number.POSITIVE_INFINITY; }

export function elapsedToString(elapsed:number, fmt:any) {
    let total = 0;
    let result = '';

    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'year', fromYrs, toYrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'week', fromDay, toDay, 7));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'day', fromDay, toDay));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'hour', fromHrs, toHrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'minute', fromMin, toMin));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'second', fromSec, toSec));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'milli', (time:number) => time, (time:number) => time));

    const last = result.lastIndexOf(', ');
    if (last >= 0) {
        const first = result.indexOf(', ');
        if (first === last) {
            result = result.slice(0, last) + ' and ' + result.slice(last+2);
        } else {
            result = result.slice(0, last) + ', and ' + result.slice(last+2);
        }
    }
    return result;
}
