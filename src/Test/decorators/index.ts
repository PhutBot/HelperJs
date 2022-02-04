import { AssertionError } from "assert";
import npmlog from "npmlog";
import { DecoratorBuilder } from "../../Meta/DecoratorBuilder";
import { TestResult } from "../TestRunner";

export function test() {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
            const og = descriptor.value;
            descriptor.value = (_:any) => {
                try {
                    og();
                    npmlog.info(target.constructor.name, `pass - ${key}`);
                    return [ TestResult.PASS ];
                } catch (err) {
                    if (err instanceof AssertionError) {
                        npmlog.error(target.constructor.name, `fail - ${key}`);
                        console.error(`${err}`);
                        return [ TestResult.FAIL ];
                    } else {
                        npmlog.error(target.constructor.name, `error - ${key}`);
                        console.error(err);
                        return [ TestResult.ERROR ];
                    }
                }
            };
        }).build();
}

export function unroll(cases:object[]) {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
            const og = descriptor.value;
            descriptor.value = (_:any) => {
                return cases.map((c:any, i:number) => {
                        try {
                            og(c);
                            npmlog.info(target.constructor.name, `pass - ${key}_${i}`);
                            return TestResult.PASS;
                        } catch (err) {
                            if (err instanceof AssertionError) {
                                npmlog.warn(target.constructor.name, `fail - ${key}_${i}`);
                                npmlog.warn(target.constructor.name, JSON.stringify(c));
                                console.warn(`${err}`);
                                return TestResult.FAIL;
                            } else {
                                npmlog.error(target.constructor.name, `error - ${key}_${i}`);
                                npmlog.error(target.constructor.name, JSON.stringify(c));
                                console.error(err);
                                return TestResult.ERROR;
                            }
                        }
                    });
            };
        }).build();
}
