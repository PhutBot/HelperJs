import { assert } from "console";

export class TestCase {

    async setup() {}
    async teardown() {}
    async before() {}
    async after() {}

    async expectError(expect:any, func:Function, self?:any, ...args:any) {
        let err = null;
        try {
            await func.apply(self, args);
        } catch (e) {
            err = e;
        }

        if (err !== expect) {
            throw err;
        }
        assert(err === expect);
    }
}