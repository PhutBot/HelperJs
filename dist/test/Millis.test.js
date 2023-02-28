var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as assert from 'assert';
import { Unroll } from "../src/Test/decorators/index.js";
import { TestCase } from "../src/Test/TestCase.js";
import * as Millis from "../src/Millis.js";
export default class EnvTest extends TestCase {
    constructor() {
        super(...arguments);
        this.filename = './.env';
    }
    from({ unit, amount, expected }) {
        const millis = Millis[`from${unit}`](amount);
        assert.equal(millis, expected);
    }
    to({ unit, amount, expected }) {
        const millis = Millis[`to${unit}`](amount);
        assert.equal(millis, expected);
    }
    elapsedToString({ elapsed, fmt, expected }) {
        assert.equal(Millis.elapsedToString(elapsed, fmt), expected);
    }
}
__decorate([
    Unroll([
        { unit: 'Sec', amount: 3, expected: 3000 },
        { unit: 'Min', amount: 3, expected: 180000 },
        { unit: 'Hrs', amount: 3, expected: 10800000 },
        { unit: 'Day', amount: 3, expected: 259200000 },
        { unit: 'Yrs', amount: 3, expected: 94608000000 },
    ])
], EnvTest.prototype, "from", null);
__decorate([
    Unroll([
        { unit: 'Sec', expected: 3, amount: 3000 },
        { unit: 'Min', expected: 3, amount: 180000 },
        { unit: 'Hrs', expected: 3, amount: 10800000 },
        { unit: 'Day', expected: 3, amount: 259200000 },
        { unit: 'Yrs', expected: 3, amount: 94608000000 },
    ])
], EnvTest.prototype, "to", null);
__decorate([
    Unroll([
        { elapsed: 3, fmt: { milli: 0 }, expected: '3 millis' },
        { elapsed: 3000, fmt: { second: 0 }, expected: '3 seconds' },
        { elapsed: 180000, fmt: { minute: 0 }, expected: '3 minutes' },
        { elapsed: 10800000, fmt: { hour: 0 }, expected: '3 hours' },
        { elapsed: 259200000, fmt: { day: 0 }, expected: '3 days' },
        { elapsed: 1814400000, fmt: { week: 0 }, expected: '3 weeks' },
        { elapsed: 94608000000, fmt: { year: 0 }, expected: '3 years' },
        { elapsed: 90000000, fmt: { day: 0 }, expected: '1 day' },
        { elapsed: 86400000, fmt: { week: 0, day: 0 }, expected: '1 day' },
        { elapsed: 94608000000, fmt: { year: 0, day: 0 }, expected: '3 years' },
        { elapsed: 86400001, fmt: { day: 0, milli: 0 }, expected: '1 day and 1 milli' },
        { elapsed: 2073600000, fmt: { week: 0, day: 0 }, expected: '3 weeks and 3 days' },
        { elapsed: 2073600001, fmt: { week: 0, day: 0, milli: 0 }, expected: '3 weeks, 3 days, and 1 milli' },
    ])
], EnvTest.prototype, "elapsedToString", null);
//# sourceMappingURL=Millis.test.js.map