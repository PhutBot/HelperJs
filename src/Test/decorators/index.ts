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
                try {
                    const test = this as TestCase; 
                    await test.before();
                    await og.call(this, c);
                    await test.after();
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
                        try {
                            const test = this as TestCase; 
                            await test.before();
                            await og.call(this, c);
                            await test.after();
                            npmlog.info(target.constructor.name, `pass - ${key}_${i}`);
                            return TestResult.PASS;
                        } catch (err) {
                            if (err instanceof AssertionError) {
                                npmlog.warn(target.constructor.name, `fail - ${key}_${i}`);
                                npmlog.warn(target.constructor.name, JSON.stringify(c));
                                npmlog.warn(target.constructor.name, `${err}`);
                                return TestResult.FAIL;
                            } else {
                                npmlog.error(target.constructor.name, `error - ${key}_${i}`);
                                npmlog.error(target.constructor.name, JSON.stringify(c));
                                npmlog.error(target.constructor.name, `${err}`);
                                return TestResult.ERROR;
                            }
                        }
                    }));
            };
        }).build();
}
