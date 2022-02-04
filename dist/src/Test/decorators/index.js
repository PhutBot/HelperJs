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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unroll = exports.test = void 0;
const assert_1 = require("assert");
const npmlog_1 = __importDefault(require("npmlog"));
const DecoratorBuilder_1 = require("../../Meta/DecoratorBuilder");
const TestRunner_1 = require("../TestRunner");
function test() {
    return new DecoratorBuilder_1.DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
        const og = descriptor.value;
        descriptor.value = (_) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield og();
                npmlog_1.default.info(target.constructor.name, `pass - ${key}`);
                return [TestRunner_1.TestResult.PASS];
            }
            catch (err) {
                if (err instanceof assert_1.AssertionError) {
                    npmlog_1.default.error(target.constructor.name, `fail - ${key}`);
                    console.error(`${err}`);
                    return [TestRunner_1.TestResult.FAIL];
                }
                else {
                    npmlog_1.default.error(target.constructor.name, `error - ${key}`);
                    console.error(err);
                    return [TestRunner_1.TestResult.ERROR];
                }
            }
        });
    }).build();
}
exports.test = test;
function unroll(cases) {
    return new DecoratorBuilder_1.DecoratorBuilder()
        .onMethod((target, key, descriptor, meta) => {
        const og = descriptor.value;
        descriptor.value = (_) => __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(cases.map((c, i) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield og(c);
                    npmlog_1.default.info(target.constructor.name, `pass - ${key}_${i}`);
                    return TestRunner_1.TestResult.PASS;
                }
                catch (err) {
                    if (err instanceof assert_1.AssertionError) {
                        npmlog_1.default.warn(target.constructor.name, `fail - ${key}_${i}`);
                        npmlog_1.default.warn(target.constructor.name, JSON.stringify(c));
                        console.warn(`${err}`);
                        return TestRunner_1.TestResult.FAIL;
                    }
                    else {
                        npmlog_1.default.error(target.constructor.name, `error - ${key}_${i}`);
                        npmlog_1.default.error(target.constructor.name, JSON.stringify(c));
                        console.error(err);
                        return TestRunner_1.TestResult.ERROR;
                    }
                }
            })));
        });
    }).build();
}
exports.unroll = unroll;
//# sourceMappingURL=index.js.map