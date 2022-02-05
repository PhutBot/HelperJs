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
const console_1 = require("console");
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
    expectError(expect, func, self, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let err = null;
            try {
                yield func.apply(self, args);
            }
            catch (e) {
                err = e;
            }
            if (err !== expect) {
                throw err;
            }
            (0, console_1.assert)(err === expect);
        });
    }
}
exports.TestCase = TestCase;
//# sourceMappingURL=TestCase.js.map