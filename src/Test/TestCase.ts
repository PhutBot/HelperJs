import { AssertionError } from "assert";

export class TestCase {

    async setup() {}
    async teardown() {}
    async before() {}
    async after() {}

    async assertError(expected:any, func:Function, self?:any, ...args:any) {
        let err = null;
        try {
            await func.apply(self, args);
        } catch (e) {
            err = e;
        }

        if (!!err && err !== expected) {
            throw err;
        } else if (!err) {
            throw new AssertionError({
                expected,
                actual: err,
                operator: '=='
            });
        }
    }
}