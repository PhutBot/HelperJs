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
import * as assert from 'assert';
import { TestCase } from "../src/Test/TestCase.js";
import { Env } from "../src/index.js";
import { EnvBackedValue } from "../src/Env.js";
import { Test, Unroll } from "../src/Test/decorators/index.js";
export default class EnvTest extends TestCase {
    constructor() {
        super(...arguments);
        this.filename = './.env';
    }
    before(testcase) {
        return __awaiter(this, void 0, void 0, function* () {
            Env.load(this.filename);
        });
    }
    getEnv({ key, val }) {
        assert.equal(Env.get(key), `${val}`);
    }
    setEnv({ testcase, key, val }) {
        key += testcase;
        Env.set(key, val);
        assert.strictEqual(Env.get(key), `${val}`);
    }
    getBackedValue({ key, val }) {
        const value = new EnvBackedValue(key);
        assert.strictEqual(value.get(), val);
    }
    setBackedValue({ testcase, key, val }) {
        key += testcase;
        const value = new EnvBackedValue(key);
        value.set(val);
        assert.strictEqual(Env.get(key), val);
    }
    getBackedValueDefault({ testcase, key, val }) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.get(), val);
    }
    getBackedValueAsBool({ testcase, key, val, expect }) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asBool(), expect);
    }
    getBackedValueAsInt({ testcase, key, val, expect }) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asInt(), expect);
    }
    getBackedValueAsFloat({ testcase, key, val, expect }) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asFloat(), expect);
    }
    getBackedValueAs({ key, val }) {
        const value = new EnvBackedValue(key.toUpperCase());
        assert.strictEqual(value[`as${key}`](), val);
    }
    getBackedValueAsNan({ testcase, key }) {
        const value = new EnvBackedValue(testcase + key, 'sdfj');
        assert.ok(Number.isNaN(value[`as${key}`]()));
    }
    wait({ testcase, key, val, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            key += testcase;
            setTimeout(() => { Env.set(key, val); }, 50);
            yield Env.waitForVar(key, timeout);
            assert.strictEqual(Env.get(key), val);
        });
    }
    timeout({ testcase, key, timeout }) {
        return __awaiter(this, void 0, void 0, function* () {
            key += testcase;
            yield assert.rejects(Env.waitForVar(key, timeout), {
                message: `Env.waitForVar - timed out waiting for environment var '${key}'`
            });
        });
    }
}
__decorate([
    Unroll([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL', val: true, },
        { key: 'INT', val: 8090, },
        { key: 'FLOAT', val: 0.123, },
    ])
], EnvTest.prototype, "getEnv", null);
__decorate([
    Unroll([
        { key: 'STRING', val: 'diff' },
        { key: 'BOOL', val: false, },
        { key: 'INT', val: 1234, },
        { key: 'FLOAT', val: 0.567, },
    ])
], EnvTest.prototype, "setEnv", null);
__decorate([
    Unroll([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL', val: 'true', },
        { key: 'INT', val: '8090', },
        { key: 'FLOAT', val: '0.123', },
        { key: 'EXTRA', val: undefined },
    ])
], EnvTest.prototype, "getBackedValue", null);
__decorate([
    Test({ key: 'EXTRA', val: 'default' })
], EnvTest.prototype, "setBackedValue", null);
__decorate([
    Test({ key: 'EXTRA', val: 'default' })
], EnvTest.prototype, "getBackedValueDefault", null);
__decorate([
    Unroll([
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
    Unroll([
        { key: 'Int', val: '1', expect: 1 },
        { key: 'Int', val: '123', expect: 123 },
        { key: 'Int', val: '1.34', expect: 1 },
        { key: 'Int', val: '4.32', expect: 4 },
        { key: 'Int', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsInt", null);
__decorate([
    Unroll([
        { key: 'Float', val: '1', expect: 1 },
        { key: 'Float', val: '123', expect: 123 },
        { key: 'Float', val: '1.34', expect: 1.34 },
        { key: 'Float', val: '4.32', expect: 4.32 },
        { key: 'Float', val: '-10', expect: -10 },
    ])
], EnvTest.prototype, "getBackedValueAsFloat", null);
__decorate([
    Unroll([
        { key: 'Bool', val: true },
        { key: 'Int', val: 8090 },
        { key: 'Float', val: 0.123 },
    ])
], EnvTest.prototype, "getBackedValueAs", null);
__decorate([
    Unroll([
        { key: 'Int' },
        { key: 'Float' },
    ])
], EnvTest.prototype, "getBackedValueAsNan", null);
__decorate([
    Test({ key: 'WAIT', val: 'VAL', timeout: 150 })
], EnvTest.prototype, "wait", null);
__decorate([
    Test({ key: 'TIMEOUT', timeout: 150 })
], EnvTest.prototype, "timeout", null);
//# sourceMappingURL=Env.test.js.map