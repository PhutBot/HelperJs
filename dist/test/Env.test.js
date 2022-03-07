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
    before(testcase) {
        return __awaiter(this, void 0, void 0, function* () {
            src_1.Env.load(this.filename);
        });
    }
    getEnv({ key, val }) {
        assert_1.default.equal(src_1.Env.get(key), `${val}`);
    }
    setEnv({ testcase, key, val }) {
        key += testcase;
        src_1.Env.set(key, val);
        assert_1.default.strictEqual(src_1.Env.get(key), `${val}`);
    }
    getBackedValue({ key, val }) {
        const value = new Env_1.EnvBackedValue(key);
        assert_1.default.strictEqual(value.get(), val);
    }
    setBackedValue({ testcase, key, val }) {
        key += testcase;
        const value = new Env_1.EnvBackedValue(key);
        value.set(val);
        assert_1.default.strictEqual(src_1.Env.get(key), val);
    }
    getBackedValueDefault({ testcase, key, val }) {
        key += testcase;
        const value = new Env_1.EnvBackedValue(key, val);
        assert_1.default.strictEqual(value.get(), val);
    }
    getBackedValueAsBool({ testcase, key, val, expect }) {
        key += testcase;
        const value = new Env_1.EnvBackedValue(key, val);
        assert_1.default.strictEqual(value.asBool(), expect);
    }
    getBackedValueAsInt({ testcase, key, val, expect }) {
        key += testcase;
        const value = new Env_1.EnvBackedValue(key, val);
        assert_1.default.strictEqual(value.asInt(), expect);
    }
    getBackedValueAsFloat({ testcase, key, val, expect }) {
        key += testcase;
        const value = new Env_1.EnvBackedValue(key, val);
        assert_1.default.strictEqual(value.asFloat(), expect);
    }
    getBackedValueAs({ key, val }) {
        const value = new Env_1.EnvBackedValue(key.toUpperCase());
        assert_1.default.strictEqual(value[`as${key}`](), val);
    }
    getBackedValueAsNan({ testcase, key }) {
        const value = new Env_1.EnvBackedValue(testcase + key, 'sdfj');
        assert_1.default.ok(Number.isNaN(value[`as${key}`]()));
    }
    wait({ testcase, key, val, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            key += testcase;
            setTimeout(() => { src_1.Env.set(key, val); }, 50);
            yield src_1.Env.waitForVar(key, timeout);
            assert_1.default.strictEqual(src_1.Env.get(key), val);
        });
    }
    timeout({ testcase, key, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            key += testcase;
            yield assert_1.default.rejects(src_1.Env.waitForVar(key, timeout), {
                message: `Env.waitForVar - timed out waiting for environment var '${key}'`
            });
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
        { key: 'Bool', val: '1', expect: true },
        { key: 'Bool', val: 'true', expect: true },
        { key: 'Bool', val: 'yes', expect: true },
        { key: 'Bool', val: 'on', expect: true },
        { key: 'Bool', val: 'TRUE', expect: true },
        { key: 'Bool', val: 'YES', expect: true },
        { key: 'Bool', val: 'ON', expect: true },
        { key: 'Bool', val: '0', expect: false },
        { key: 'Bool', val: 'false', expect: false },
        { key: 'Bool', val: 'no', expect: false },
        { key: 'Bool', val: 'off', expect: false },
        { key: 'Bool', val: 'FALSE', expect: false },
        { key: 'Bool', val: 'NO', expect: false },
        { key: 'Bool', val: 'OFF', expect: false },
        { key: 'Bool', val: 'sdfh', expect: false },
    ])
], EnvTest.prototype, "getBackedValueAsBool", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'Int', val: '1', expect: 1 },
        { key: 'Int', val: '123', expect: 123 },
        { key: 'Int', val: '1.34', expect: 1 },
        { key: 'Int', val: '4.32', expect: 4 },
        { key: 'Int', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsInt", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'Float', val: '1', expect: 1 },
        { key: 'Float', val: '123', expect: 123 },
        { key: 'Float', val: '1.34', expect: 1.34 },
        { key: 'Float', val: '4.32', expect: 4.32 },
        { key: 'Float', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsFloat", null);
__decorate([
    (0, decorators_1.Unroll)([
        { key: 'Bool', val: true },
        { key: 'Int', val: 8090 },
        { key: 'Float', val: 0.123 },
    ])
], EnvTest.prototype, "getBackedValueAs", null);
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