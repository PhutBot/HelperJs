"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const decorators_1 = require("../src/Test/decorators");
const TestCase_1 = require("../src/Test/TestCase");
const src_1 = require("../src");
const Env_1 = require("../src/Env");
class EnvTest extends TestCase_1.TestCase {
    constructor() {
        super(...arguments);
        this.filename = './.env';
    }
    getEnv({ key, val }) {
        src_1.Env.load(this.filename);
        (0, assert_1.default)(src_1.Env.get(key) === `${val}`);
    }
    setEnv({ key, val }) {
        src_1.Env.load(this.filename);
        src_1.Env.set(key, val);
        (0, assert_1.default)(src_1.Env.get(key) === `${val}`);
    }
    getBackedValue({ key, val }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key);
        (0, assert_1.default)(value.get() === val);
    }
    setBackedValue({ key, val }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key);
        value.set(val);
        (0, assert_1.default)(src_1.Env.get('EXTRA') === val);
    }
    getBackedValueDefault({ key, val }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key, val);
        (0, assert_1.default)(value.get() === val);
    }
    getBackedValueAsBool({ key, val, expect }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key, val);
        (0, assert_1.default)(value.asBool() === expect);
    }
    getBackedValueAsInt({ key, val, expect }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key, val);
        (0, assert_1.default)(value.asInt() === expect);
    }
    getBackedValueAsFloat({ key, val, expect }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key, val);
        (0, assert_1.default)(value.asFloat() === expect);
    }
    getBackedValueAsNan({ key }) {
        src_1.Env.load(this.filename);
        const value = new Env_1.EnvBackedValue(key, 'sdfj');
        (0, assert_1.default)(Number.isNaN(value[`as${key}`]()));
    }
    wait({ key, val, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            src_1.Env.load(this.filename);
            setTimeout(() => { src_1.Env.set(key, val); }, 50);
            yield src_1.Env.waitForVar(key, timeout);
            (0, assert_1.default)(src_1.Env.get(key) === val);
        });
    }
    timeout({ key, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            src_1.Env.load(this.filename);
            yield this.assertError(`Env.waitForVar - timed out waiting for environment var '${key}'`, src_1.Env.waitForVar, src_1.Env, key, timeout);
        });
    }
}
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL', val: true, },
        { key: 'INT', val: 8090, },
        { key: 'FLOAT', val: 0.123, },
    ])
], EnvTest.prototype, "getEnv", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'STRING', val: 'diff' },
        { key: 'BOOL', val: false, },
        { key: 'INT', val: 1234, },
        { key: 'FLOAT', val: 0.567, },
    ])
], EnvTest.prototype, "setEnv", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL', val: 'true', },
        { key: 'INT', val: '8090', },
        { key: 'FLOAT', val: '0.123', },
        { key: 'EXTRA', val: undefined },
    ])
], EnvTest.prototype, "getBackedValue", null);
__decorate([
    (0, decorators_1.Test)({ key: 'EXTRA', val: 'default' })
], EnvTest.prototype, "setBackedValue", null);
__decorate([
    (0, decorators_1.Test)({ key: 'EXTRA', val: 'default' })
], EnvTest.prototype, "getBackedValueDefault", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'BOOL', val: undefined, expect: true },
        { key: 'bool', val: '1', expect: true },
        { key: 'bool', val: 'true', expect: true },
        { key: 'bool', val: 'yes', expect: true },
        { key: 'bool', val: 'on', expect: true },
        { key: 'bool', val: 'TRUE', expect: true },
        { key: 'bool', val: 'YES', expect: true },
        { key: 'bool', val: 'ON', expect: true },
        { key: 'bool', val: '0', expect: false },
        { key: 'bool', val: 'false', expect: false },
        { key: 'bool', val: 'no', expect: false },
        { key: 'bool', val: 'off', expect: false },
        { key: 'bool', val: 'FALSE', expect: false },
        { key: 'bool', val: 'NO', expect: false },
        { key: 'bool', val: 'OFF', expect: false },
        { key: 'bool', val: 'sdfh', expect: false },
    ])
], EnvTest.prototype, "getBackedValueAsBool", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'INT', val: undefined, expect: 8090 },
        { key: 'int', val: '1', expect: 1 },
        { key: 'int', val: '123', expect: 123 },
        { key: 'int', val: '1.34', expect: 1 },
        { key: 'int', val: '4.32', expect: 4 },
        { key: 'int', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsInt", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'FLOAT', val: undefined, expect: 0.123 },
        { key: 'float', val: '1', expect: 1 },
        { key: 'float', val: '123', expect: 123 },
        { key: 'float', val: '1.34', expect: 1.34 },
        { key: 'float', val: '4.32', expect: 4.32 },
        { key: 'float', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsFloat", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'Int' },
        { key: 'Float' },
    ])
], EnvTest.prototype, "getBackedValueAsNan", null);
__decorate([
    (0, decorators_1.Test)({ key: 'WAIT', val: 'VAL', timeout: 150 })
], EnvTest.prototype, "wait", null);
__decorate([
    (0, decorators_1.Test)({ key: 'TIMEOUT', timeout: 150 })
], EnvTest.prototype, "timeout", null);
exports.default = EnvTest;
//# sourceMappingURL=Env.test.js.map