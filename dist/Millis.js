"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elapsedToString = exports.inf = exports.toYrs = exports.toDay = exports.toHrs = exports.toMin = exports.toSec = exports.fromYrs = exports.fromDay = exports.fromHrs = exports.fromMin = exports.fromSec = void 0;
function elapsedToStringHelper(elapsed, result, total, fmt, name, from, to, mul = 1) {
    if (name in fmt) {
        const value = Math.max(fmt[name], Math.floor(to(elapsed - total) / mul));
        total += from(value * mul);
        if (value > 0) {
            if (!!result)
                result += ', ';
            result += `${value} ${name}`;
        }
    }
    return { result, total };
}
function fromSec(time) { return time * 1000; }
exports.fromSec = fromSec;
function fromMin(time) { return time * 60 * 1000; }
exports.fromMin = fromMin;
function fromHrs(time) { return time * 60 * 60 * 1000; }
exports.fromHrs = fromHrs;
function fromDay(time) { return time * 24 * 60 * 60 * 1000; }
exports.fromDay = fromDay;
function fromYrs(time) { return time * 365 * 24 * 60 * 60 * 1000; }
exports.fromYrs = fromYrs;
function toSec(time) { return Math.floor(time / 1000); }
exports.toSec = toSec;
function toMin(time) { return Math.floor(time / 1000 / 60); }
exports.toMin = toMin;
function toHrs(time) { return Math.floor(time / 1000 / 60 / 60); }
exports.toHrs = toHrs;
function toDay(time) { return Math.floor(time / 1000 / 60 / 60 / 24); }
exports.toDay = toDay;
function toYrs(time) { return Math.floor(time / 1000 / 60 / 60 / 24 / 365); }
exports.toYrs = toYrs;
function inf(_) { return Number.POSITIVE_INFINITY; }
exports.inf = inf;
function elapsedToString(elapsed, fmt) {
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
        result = result.slice(0, idx) + ' and ' + result.slice(idx + 2);
    return result;
}
exports.elapsedToString = elapsedToString;
