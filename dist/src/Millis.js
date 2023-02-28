function elapsedToStringHelper(elapsed, result, total, fmt, name, from, to, mul = 1) {
    if (name in fmt) {
        const value = Math.max(fmt[name], Math.floor(to(elapsed - total) / mul));
        total += from(value * mul);
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
export function fromSec(time) { return time * 1000; }
export function fromMin(time) { return time * 60 * 1000; }
export function fromHrs(time) { return time * 60 * 60 * 1000; }
export function fromDay(time) { return time * 24 * 60 * 60 * 1000; }
export function fromYrs(time) { return time * 365 * 24 * 60 * 60 * 1000; }
export function toSec(time) { return Math.floor(time / 1000); }
export function toMin(time) { return Math.floor(time / 1000 / 60); }
export function toHrs(time) { return Math.floor(time / 1000 / 60 / 60); }
export function toDay(time) { return Math.floor(time / 1000 / 60 / 60 / 24); }
export function toYrs(time) { return Math.floor(time / 1000 / 60 / 60 / 24 / 365); }
export function inf(_) { return Number.POSITIVE_INFINITY; }
export function elapsedToString(elapsed, fmt) {
    let total = 0;
    let result = '';
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'year', fromYrs, toYrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'week', fromDay, toDay, 7));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'day', fromDay, toDay));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'hour', fromHrs, toHrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'minute', fromMin, toMin));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'second', fromSec, toSec));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'milli', (time) => time, (time) => time));
    const last = result.lastIndexOf(', ');
    if (last >= 0) {
        const first = result.indexOf(', ');
        if (first === last) {
            result = result.slice(0, last) + ' and ' + result.slice(last + 2);
        }
        else {
            result = result.slice(0, last) + ', and ' + result.slice(last + 2);
        }
    }
    return result;
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=Millis.js.map