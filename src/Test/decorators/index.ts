import { AssertionError } from "assert";
import npmlog from "npmlog";
import { DecoratorBuilder } from "../../Meta/DecoratorBuilder";
import { TestCase } from "../TestCase";
import { TestResult } from "../TestRunner";

export function Test(c?:{}) {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
            const og = descriptor.value;
            descriptor.value = async function(_:any) {
                const test = this as TestCase; 
                const ctx = await test.before(key);

                try {
                    await og.call(this, { context: ctx, testcase: key, ...c });
                    npmlog.info(target.constructor.name, `pass - ${key}`);
                    return [ TestResult.PASS ];
                } catch (err) {
                    if (err instanceof AssertionError) {
                        npmlog.warn(target.constructor.name, `fail - ${key}`);
                        npmlog.warn(target.constructor.name, JSON.stringify(c));
                        npmlog.warn(target.constructor.name, `${err}`);
                        return [ TestResult.FAIL ];
                    } else {
                        npmlog.error(target.constructor.name, `error - ${key}`);
                        npmlog.error(target.constructor.name, JSON.stringify(c));
                        npmlog.error(target.constructor.name, `${err}`);
                        return [ TestResult.ERROR ];
                    }
                } finally {
                    await test.after(key, ctx);
                }
            };
        }).build();
}

export function Unroll(cases:object[]) {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
            const og = descriptor.value;
            descriptor.value = async function(_:any) {
                return await Promise.all(cases.map(async (c:any, i:number) => {
                        const testcase = `${key}_${i}`;
                        const test = this as TestCase; 
                        const ctx = await test.before(testcase);
                        
                        try {
                            await og.call(this, { context: ctx, testcase, ...c });
                            npmlog.info(target.constructor.name, `pass - ${testcase}`);
                            return TestResult.PASS;
                        } catch (err) {
                            if (err instanceof AssertionError) {
                                npmlog.warn(target.constructor.name, `fail - ${testcase}`);
                                npmlog.warn(target.constructor.name, JSON.stringify(c));
                                npmlog.warn(target.constructor.name, `${err}`);
                                return TestResult.FAIL;
                            } else {
                                npmlog.error(target.constructor.name, `error - ${testcase}`);
                                npmlog.error(target.constructor.name, JSON.stringify(c));
                                npmlog.error(target.constructor.name, `${err}`);
                                return TestResult.ERROR;
                            }
                        } finally {
                            await test.after(testcase, ctx);
                        }
                    }));
            };
        }).build();
}
