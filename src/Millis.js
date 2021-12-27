function elapsedToStringHelper(elapsed, result, total, fmt, name, from, to, mul=1) {
    if (name in fmt) {
        const value = Math.max(fmt[name], Math.floor(to(elapsed - total)/mul));
        total += from(value*mul);
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

    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'years', fromYrs, toYrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'weeks', fromDay, toDay, 7));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'days', fromDay, toDay));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'hours', fromHrs, toHrs));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'minutes', fromMin, toMin));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'seconds', fromSec, toSec));
    ({ result, total } = elapsedToStringHelper(elapsed, result, total, fmt, 'millis', (time) => time, (time) => time));

    const idx = result.lastIndexOf(', ');
    if (idx >= 0)
        result = result.slice(0, idx) + ' and ' + result.slice(idx+2);
    return result;
}
