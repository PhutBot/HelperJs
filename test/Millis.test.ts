import * as assert from 'assert';
import { Unroll } from "../src/Test/decorators/index.js";
import { TestCase } from "../src/Test/TestCase.js";
import { Env } from "../src/index.js";
import * as Millis from "../src/Millis.js";

export default class EnvTest extends TestCase {
    readonly filename = './.env';

    @Unroll([
        { unit: 'Sec', amount: 3, expected: 3000        },
        { unit: 'Min', amount: 3, expected: 180000      },
        { unit: 'Hrs', amount: 3, expected: 10800000    },
        { unit: 'Day', amount: 3, expected: 259200000   },
        { unit: 'Yrs', amount: 3, expected: 94608000000 },
    ])
    from({ unit, amount, expected }:any) {
        const millis = (Millis as any)[`from${unit}`](amount);
        assert.equal(millis, expected);
    }

    @Unroll([
        { unit: 'Sec', expected: 3, amount: 3000        },
        { unit: 'Min', expected: 3, amount: 180000      },
        { unit: 'Hrs', expected: 3, amount: 10800000    },
        { unit: 'Day', expected: 3, amount: 259200000   },
        { unit: 'Yrs', expected: 3, amount: 94608000000 },
    ])
    to({ unit, amount, expected }:any) {
        const millis = (Millis as any)[`to${unit}`](amount);
        assert.equal(millis, expected);
    }

    @Unroll([
        { elapsed: 3,           fmt: { milli:  0 }, expected: '3 millis'  },
        { elapsed: 3000,        fmt: { second: 0 }, expected: '3 seconds' },
        { elapsed: 180000,      fmt: { minute: 0 }, expected: '3 minutes' },
        { elapsed: 10800000,    fmt: { hour:   0 }, expected: '3 hours'   },
        { elapsed: 259200000,   fmt: { day:    0 }, expected: '3 days'    },
        { elapsed: 1814400000,  fmt: { week:   0 }, expected: '3 weeks'   },
        { elapsed: 94608000000, fmt: { year:   0 }, expected: '3 years'   },
        { elapsed: 90000000,    fmt: { day:    0 }, expected: '1 day'     },
        { elapsed: 86400000,    fmt: { week: 0, day:   0 }, expected: '1 day' },
        { elapsed: 94608000000, fmt: { year: 0, day:   0 }, expected: '3 years' },
        { elapsed: 86400001,    fmt: { day:  0, milli: 0 }, expected: '1 day and 1 milli' },
        { elapsed: 2073600000,  fmt: { week: 0, day:   0 }, expected: '3 weeks and 3 days' },
        { elapsed: 2073600001,  fmt: { week: 0, day: 0, milli: 0 }, expected: '3 weeks, 3 days, and 1 milli' },
    ])
    elapsedToString({ elapsed, fmt, expected }:any) {
        assert.equal(Millis.elapsedToString(elapsed, fmt), expected);
    }
}
