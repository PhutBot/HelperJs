import assert from "assert";
import { Test, Unroll } from "../src/Test/decorators";
import { TestCase } from "../src/Test/TestCase";
import { Env } from "../src";
import { EnvBackedValue } from "../src/Env";

export default class EnvTest extends TestCase {
    readonly filename = './.env';

    @Unroll([
        { key: 'STRING', val: 'test' },
        { key: 'BOOL',   val: true,  },
        { key: 'INT',    val: 8090,  },
        { key: 'FLOAT',  val: 0.123, },
    ])
    getEnv({ key, val }:any) {
        Env.load(this.filename);
        assert(Env.get(key) === `${val}`);
    }

    @Unroll([
        { key: 'STRING', val: 'diff' },
        { key: 'BOOL',   val: false, },
        { key: 'INT',    val: 1234,  },
        { key: 'FLOAT',  val: 0.567, },
    ])
    setEnv({ key, val }:any) {
        Env.load(this.filename);
        Env.set(key, val);
        assert(Env.get(key) === `${val}`);
    }

    @Unroll([
        { key: 'STRING', val: 'test'    },
        { key: 'BOOL',   val: 'true',   },
        { key: 'INT',    val: '8090',   },
        { key: 'FLOAT',  val: '0.123',  },
        { key: 'EXTRA',  val: undefined },
    ])
    getBackedValue({ key, val }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key);
        assert(value.get() === val);
    }

    @Test({ key:'EXTRA', val:'default' })
    setBackedValue({ key, val }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key);
        value.set(val)
        assert(Env.get('EXTRA') === val);
    }

    @Test({ key:'EXTRA', val:'default' })
    getBackedValueDefault({ key, val }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key, val);
        assert(value.get() === val);
    }

    @Unroll([
        { key: 'BOOL', val: undefined, expect: true },
        { key: 'bool', val: '1',       expect: true },
        { key: 'bool', val: 'true',    expect: true },
        { key: 'bool', val: 'yes',     expect: true },
        { key: 'bool', val: 'on',      expect: true },
        { key: 'bool', val: 'TRUE',    expect: true },
        { key: 'bool', val: 'YES',     expect: true },
        { key: 'bool', val: 'ON',      expect: true },
        { key: 'bool', val: '0',       expect: false },
        { key: 'bool', val: 'false',   expect: false },
        { key: 'bool', val: 'no',      expect: false },
        { key: 'bool', val: 'off',     expect: false },
        { key: 'bool', val: 'FALSE',   expect: false },
        { key: 'bool', val: 'NO',      expect: false },
        { key: 'bool', val: 'OFF',     expect: false },
        { key: 'bool', val: 'sdfh',    expect: false },
    ])
    getBackedValueAsBool({ key, val, expect }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key, val);
        assert(value.asBool() === expect);
    }

    @Unroll([
        { key: 'INT', val: undefined, expect: 8090 },
        { key: 'int', val: '1',       expect: 1    },
        { key: 'int', val: '123',     expect: 123  },
        { key: 'int', val: '1.34',    expect: 1    },
        { key: 'int', val: '4.32',    expect: 4    },
        { key: 'int', val: '-10',     expect: -10  },
    ])
    getBackedValueAsInt({ key, val, expect }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key, val);
        assert(value.asInt() === expect);
    }

    @Unroll([
        { key: 'FLOAT', val: undefined, expect: 0.123 },
        { key: 'float', val: '1',       expect: 1     },
        { key: 'float', val: '123',     expect: 123   },
        { key: 'float', val: '1.34',    expect: 1.34  },
        { key: 'float', val: '4.32',    expect: 4.32  },
        { key: 'float', val: '-10',     expect: -10   },
    ])
    getBackedValueAsFloat({ key, val, expect }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key, val);
        assert(value.asFloat() === expect);
    }

    @Unroll([
        { key: 'Int'   },
        { key: 'Float' },
    ])
    getBackedValueAsNan({ key }:any) {
        Env.load(this.filename);
        const value = new EnvBackedValue(key, 'sdfj');
        assert(Number.isNaN((value as any)[`as${key}`]()));
    }

    @Test({ key:'WAIT', val:'VAL', timeout:150 })
    async wait({ key, val, timeout }:any) {
        Env.load(this.filename);
        setTimeout(() => { Env.set(key, val); }, 50);
        await Env.waitForVar(key, timeout);
        assert(Env.get(key) === val);
    }

    @Test({ key:'TIMEOUT', timeout:150 })
    async timeout({ key, timeout }:any) {
        Env.load(this.filename);
        await this.assertError(`Env.waitForVar - timed out waiting for environment var '${key}'`,
            Env.waitForVar, Env, key, timeout);
    }
}
