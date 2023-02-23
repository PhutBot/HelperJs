import { AssertionError } from "assert";
import { DefaultLogger } from "../../Log";
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
                    DefaultLogger.info(target.constructor.name, `pass - ${key}`);
                    return [ TestResult.PASS ];
                } catch (err) {
                    if (err instanceof AssertionError) {
                        DefaultLogger.warn(target.constructor.name, `fail - ${key}`);
                        DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                        DefaultLogger.warn(target.constructor.name, `${err}`);
                        return [ TestResult.FAIL ];
                    } else {
                        DefaultLogger.error(target.constructor.name, `error - ${key}`);
                        DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                        DefaultLogger.error(target.constructor.name, `${err}`);
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
                            DefaultLogger.info(target.constructor.name, `pass - ${testcase}`);
                            return TestResult.PASS;
                        } catch (err) {
                            if (err instanceof AssertionError) {
                                DefaultLogger.warn(target.constructor.name, `fail - ${testcase}`);
                                DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                                DefaultLogger.warn(target.constructor.name, `${err}`);
                                return TestResult.FAIL;
                            } else {
                                DefaultLogger.error(target.constructor.name, `error - ${testcase}`);
                                DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                                DefaultLogger.error(target.constructor.name, `${err}`);
                                return TestResult.ERROR;
                            }
                        } finally {
                            await test.after(testcase, ctx);
                        }
                    }));
            };
        }).build();
}
