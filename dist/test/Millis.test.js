"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const decorators_1 = require("../src/Test/decorators");
const TestCase_1 = require("../src/Test/TestCase");
const Millis = __importStar(require("../src/Millis"));
class EnvTest extends TestCase_1.TestCase {
    constructor() {
        super(...arguments);
        this.filename = './.env';
    }
    from({ unit, amount, expected }) {
        const millis = Millis[`from${unit}`](amount);
        assert_1.default.equal(millis, expected);
    }
    to({ unit, amount, expected }) {
        const millis = Millis[`to${unit}`](amount);
        assert_1.default.equal(millis, expected);
    }
    elapsedToString({ elapsed, fmt, expected }) {
        assert_1.default.equal(Millis.elapsedToString(elapsed, fmt), expected);
    }
}
__decorate([
    (0, decorators_1.Unroll)([
        { unit: 'Sec', amount: 3, expected: 3000 },
        { unit: 'Min', amount: 3, expected: 180000 },
        { unit: 'Hrs', amount: 3, expected: 10800000 },
        { unit: 'Day', amount: 3, expected: 259200000 },
        { unit: 'Yrs', amount: 3, expected: 94608000000 },
    ])
], EnvTest.prototype, "from", null);
__decorate([
    (0, decorators_1.Unroll)([
        { unit: 'Sec', expected: 3, amount: 3000 },
        { unit: 'Min', expected: 3, amount: 180000 },
        { unit: 'Hrs', expected: 3, amount: 10800000 },
        { unit: 'Day', expected: 3, amount: 259200000 },
        { unit: 'Yrs', expected: 3, amount: 94608000000 },
    ])
], EnvTest.prototype, "to", null);
__decorate([
    (0, decorators_1.Unroll)([
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
exports.default = EnvTest;
//# sourceMappingURL=Millis.test.js.map