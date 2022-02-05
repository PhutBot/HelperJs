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
exports.TestCase = void 0;
const assert_1 = require("assert");
class TestCase {
    setup() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    before() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    after() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    assertError(expected, func, self, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let err = null;
            try {
                yield func.apply(self, args);
            }
            catch (e) {
                err = e;
            }
            if (!!err && err !== expected) {
                throw err;
            }
            else if (!err) {
                throw new assert_1.AssertionError({
                    expected,
                    actual: err,
                    operator: '=='
                });
            }
        });
    }
}
exports.TestCase = TestCase;
//# sourceMappingURL=TestCase.js.map