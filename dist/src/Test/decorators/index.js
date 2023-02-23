"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unroll = exports.Test = void 0;
const assert_1 = require("assert");
const Log_1 = require("../../Log");
const DecoratorBuilder_1 = require("../../Meta/DecoratorBuilder");
const TestRunner_1 = require("../TestRunner");
function Test(c) {
    return new DecoratorBuilder_1.DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
        const og = descriptor.value;
        descriptor.value = function (_) {
            return __awaiter(this, void 0, void 0, function* () {
                const test = this;
                const ctx = yield test.before(key);
                try {
                    yield og.call(this, Object.assign({ context: ctx, testcase: key }, c));
                    Log_1.DefaultLogger.info(target.constructor.name, `pass - ${key}`);
                    return [TestRunner_1.TestResult.PASS];
                }
                catch (err) {
                    if (err instanceof assert_1.AssertionError) {
                        Log_1.DefaultLogger.warn(target.constructor.name, `fail - ${key}`);
                        Log_1.DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                        Log_1.DefaultLogger.warn(target.constructor.name, `${err}`);
                        return [TestRunner_1.TestResult.FAIL];
                    }
                    else {
                        Log_1.DefaultLogger.error(target.constructor.name, `error - ${key}`);
                        Log_1.DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                        Log_1.DefaultLogger.error(target.constructor.name, `${err}`);
                        return [TestRunner_1.TestResult.ERROR];
                    }
                }
                finally {
                    yield test.after(key, ctx);
                }
            });
        };
    }).build();
}
exports.Test = Test;
function Unroll(cases) {
    return new DecoratorBuilder_1.DecoratorBuilder()
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
                        Log_1.DefaultLogger.info(target.constructor.name, `pass - ${testcase}`);
                        return TestRunner_1.TestResult.PASS;
                    }
                    catch (err) {
                        if (err instanceof assert_1.AssertionError) {
                            Log_1.DefaultLogger.warn(target.constructor.name, `fail - ${testcase}`);
                            Log_1.DefaultLogger.warn(target.constructor.name, JSON.stringify(c));
                            Log_1.DefaultLogger.warn(target.constructor.name, `${err}`);
                            return TestRunner_1.TestResult.FAIL;
                        }
                        else {
                            Log_1.DefaultLogger.error(target.constructor.name, `error - ${testcase}`);
                            Log_1.DefaultLogger.error(target.constructor.name, JSON.stringify(c));
                            Log_1.DefaultLogger.error(target.constructor.name, `${err}`);
                            return TestRunner_1.TestResult.ERROR;
                        }
                    }
                    finally {
                        yield test.after(testcase, ctx);
                    }
                })));
            });
        };
    }).build();
}
exports.Unroll = Unroll;
//# sourceMappingURL=index.js.map