var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AssertionError } from 'assert';
import { DefaultLogger } from "../../Log.js";
import { DecoratorBuilder } from "../../Meta/DecoratorBuilder.js";
import { TestResult } from "../TestRunner.js";
export function Test(c) {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
        const og = descriptor.value;
        descriptor.value = function (_) {
            return __awaiter(this, void 0, void 0, function* () {
                const test = this;
                const ctx = yield test.before(key);
                try {
                    yield og.call(this, Object.assign({ context: ctx, testcase: key }, c));
                    DefaultLogger.info(target.constructor.name, `pass - ${key}`);
                    return [TestResult.PASS];
                }
                catch (err) {
                    if (err instanceof AssertionError) {
                        DefaultLogger.warn(target.constructor.name, `fail - ${key}`);
                        DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                        DefaultLogger.warn(target.constructor.name, `${err}`);
                        return [TestResult.FAIL];
                    }
                    else {
                        DefaultLogger.error(target.constructor.name, `error - ${key}`);
                        DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                        DefaultLogger.error(target.constructor.name, `${err}`);
                        return [TestResult.ERROR];
                    }
                }
                finally {
                    yield test.after(key, ctx);
                }
            });
        };
        return null;
    }).build();
}
export function Unroll(cases) {
    return new DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
        const og = descriptor.value;
        descriptor.value = function (_) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield Promise.all(cases.map((c, i) => __awaiter(this, void 0, void 0, function* () {
                    const testcase = `${key}_${i}`;
                    const test = this;
                    const ctx = yield test.before(testcase);
                    try {
                        yield og.call(this, Object.assign({ context: ctx, testcase }, c));
                        DefaultLogger.info(target.constructor.name, `pass - ${testcase}`);
                        return TestResult.PASS;
                    }
                    catch (err) {
                        if (err instanceof AssertionError) {
                            DefaultLogger.warn(target.constructor.name, `fail - ${testcase}`);
                            DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                            DefaultLogger.warn(target.constructor.name, `${err}`);
                            return TestResult.FAIL;
                        }
                        else {
                            DefaultLogger.error(target.constructor.name, `error - ${testcase}`);
                            DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                            DefaultLogger.error(target.constructor.name, `${err}`);
                            return TestResult.ERROR;
                        }
                    }
                    finally {
                        yield test.after(testcase, ctx);
                    }
                })));
            });
        };
        return null;
    }).build();
}
//# sourceMappingURL=index.js.map