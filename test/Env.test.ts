import * as assert from 'assert';
import { TestCase } from "../src/Test/TestCase.js";
import { Env } from "../src/index.js";
import { EnvBackedValue } from "../src/Env.js";
import { Test, Unroll } from "../src/Test/decorators/index.js"; 

export default class EnvTest extends TestCase {
    readonly filename = './.env';

    async before(testcase:string) {
        Env.load(this.filename);
    }

    @Unroll([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL',   val: true,  },
        { key: 'INT',    val: 8090,  },
        { key: 'FLOAT',  val: 0.123, },
    ])
    getEnv({ key, val }:any) {
        assert.equal(Env.get(key), `${val}`);
    }

    @Unroll([
        { key: 'STRING', val: 'diff' },
        { key: 'BOOL',   val: false, },
        { key: 'INT',    val: 1234,  },
        { key: 'FLOAT',  val: 0.567, },
    ])
    setEnv({ testcase, key, val }:any) {
        key += testcase;
        Env.set(key, val);
        assert.strictEqual(Env.get(key), `${val}`);
    }

    @Unroll([
        { key: 'STRING', val: 'test'    },
        { key: 'BOOL',   val: 'true',   },
        { key: 'INT',    val: '8090',   },
        { key: 'FLOAT',  val: '0.123',  },
        { key: 'EXTRA',  val: undefined },
    ])
    getBackedValue({ key, val }:any) {
        const value = new EnvBackedValue(key);
        assert.strictEqual(value.get(), val);
    }

    @Test({ key:'EXTRA', val:'default' })
    setBackedValue({ testcase, key, val }:any) {
        key += testcase;
        const value = new EnvBackedValue(key);
        value.set(val)
        assert.strictEqual(Env.get(key), val);
    }

    @Test({ key:'EXTRA', val:'default' })
    getBackedValueDefault({ testcase, key, val }:any) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.get(), val);
    }

    @Unroll([
        { key: 'Bool', val: '1',       expect: true },
        { key: 'Bool', val: 'true',    expect: true },
        { key: 'Bool', val: 'yes',     expect: true },
        { key: 'Bool', val: 'on',      expect: true },
        { key: 'Bool', val: 'TRUE',    expect: true },
        { key: 'Bool', val: 'YES',     expect: true },
        { key: 'Bool', val: 'ON',      expect: true },
        { key: 'Bool', val: '0',       expect: false },
        { key: 'Bool', val: 'false',   expect: false },
        { key: 'Bool', val: 'no',      expect: false },
        { key: 'Bool', val: 'off',     expect: false },
        { key: 'Bool', val: 'FALSE',   expect: false },
        { key: 'Bool', val: 'NO',      expect: false },
        { key: 'Bool', val: 'OFF',     expect: false },
        { key: 'Bool', val: 'sdfh',    expect: false },
    ])
    getBackedValueAsBool({ testcase, key, val, expect }:any) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asBool(), expect);
    }

    @Unroll([
        { key: 'Int', val: '1',       expect: 1    },
        { key: 'Int', val: '123',     expect: 123  },
        { key: 'Int', val: '1.34',    expect: 1    },
        { key: 'Int', val: '4.32',    expect: 4    },
        { key: 'Int', val: '-10',     expect: -10  },
    ])
    getBackedValueAsInt({ testcase, key, val, expect }:any) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asInt(), expect);
    }

    @Unroll([
        { key: 'Float', val: '1',       expect: 1     },
        { key: 'Float', val: '123',     expect: 123   },
        { key: 'Float', val: '1.34',    expect: 1.34  },
        { key: 'Float', val: '4.32',    expect: 4.32  },
        { key: 'Float', val: '-10',     expect: -10   },
    ])
    getBackedValueAsFloat({ testcase, key, val, expect }:any) {
        key += testcase;
        const value = new EnvBackedValue(key, val);
        assert.strictEqual(value.asFloat(), expect);
    }

    @Unroll([
        { key: 'Bool',  val: true },
        { key: 'Int',   val: 8090 },
        { key: 'Float', val: 0.123 },
    ])
    getBackedValueAs({ key, val }:any) {
        const value = new EnvBackedValue(key.toUpperCase());
        assert.strictEqual((value as any)[`as${key}`](), val);
    }

    @Unroll([
        { key: 'Int'   },
        { key: 'Float' },
    ])
    getBackedValueAsNan({ testcase, key }:any) {
        const value = new EnvBackedValue(testcase+key, 'sdfj');
        assert.ok(Number.isNaN((value as any)[`as${key}`]()));
    }

    @Test({ key:'WAIT', val:'VAL', timeout:150 })
    async wait({ testcase, key, val, timeout }:any) {
        key += testcase;
        setTimeout(() => { Env.set(key, val); }, 50);
        await Env.waitForVar(key, timeout);
        assert.strictEqual(Env.get(key), val);
    }
    
    @Test({ key:'TIMEOUT', timeout:150 })
    async timeout({ testcase, key, timeout }:any) {
        key += testcase;
        await assert.rejects(Env.waitForVar(key, timeout), {
            message: `Env.waitForVar - timed out waiting for environment var '${key}'`
        });
    }
}
