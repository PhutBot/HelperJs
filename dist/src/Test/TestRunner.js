"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.RunTests = exports.TestResult = void 0;
const fs = __importStar(require("fs"));
const npmlog_1 = __importDefault(require("npmlog"));
const path_1 = __importDefault(require("path"));
const Metadata_1 = require("../Meta/Metadata");
const TestCase_1 = require("./TestCase");
;
var TestResult;
(function (TestResult) {
    TestResult["PASS"] = "PASS";
    TestResult["FAIL"] = "FAIL";
    TestResult["ERROR"] = "ERROR";
    TestResult["_TOTAL"] = "TOTAL";
})(TestResult = exports.TestResult || (exports.TestResult = {}));
function walk(dir, action, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs.statSync(dir).isDirectory()) {
            const files = !options.filter
                ? fs.readdirSync(dir)
                : fs.readdirSync(dir).filter((p) => {
                    return fs.statSync(path_1.default.join(dir, p)).isDirectory()
                        || options.filter(p);
                });
            for (const file of files) {
                if (options.step)
                    yield walk(path_1.default.join(dir, file), action, options);
                else
                    walk(path_1.default.join(dir, file), action, options);
            }
        }
        else {
            if (options.step)
                yield action(dir);
            else
                action(dir);
        }
    });
}
function logResult(prefix, result, spaces = 0) {
    npmlog_1.default.info(prefix, '----------------------------------------------------------------');
    npmlog_1.default.info(prefix, `Results: ${JSON.stringify(result, null, spaces)}`);
    npmlog_1.default.info(prefix, '----------------------------------------------------------------');
    npmlog_1.default.info('', '');
}
function RunTests(dir, root = "./") {
    return __awaiter(this, void 0, void 0, function* () {
        const fullResults = {
            TOTAL: 0,
            PASS: 0,
            FAIL: 0,
            ERROR: 0
        };
        yield walk(dir, (filePath) => __awaiter(this, void 0, void 0, function* () {
            if (filePath === `${dir}/index.js`)
                return;
            const module = yield Promise.resolve().then(() => __importStar(require(path_1.default.join(root, filePath))));
            if (!!module.default && module.default.prototype instanceof TestCase_1.TestCase) {
                const fileResults = {
                    TOTAL: 0,
                    PASS: 0,
                    FAIL: 0,
                    ERROR: 0
                };
                const test = new module.default();
                yield test.setup();
                const promises = Object.values(Object.getOwnPropertyDescriptors(module.default.prototype))
                    .filter((desc) => !!(0, Metadata_1.getMetadata)(desc.value, '@Test') || !!(0, Metadata_1.getMetadata)(desc.value, '@Unroll'))
                    .map((desc) => __awaiter(this, void 0, void 0, function* () {
                    yield test.before();
                    const result = yield desc.value.apply(test);
                    yield test.after();
                    result.forEach((res) => {
                        fileResults.TOTAL += 1;
                        fileResults.PASS += res === TestResult.PASS ? 1 : 0;
                        fileResults.FAIL += res === TestResult.FAIL ? 1 : 0;
                        fileResults.ERROR += res === TestResult.ERROR ? 1 : 0;
                        fullResults.TOTAL += 1;
                        fullResults.PASS += res === TestResult.PASS ? 1 : 0;
                        fullResults.FAIL += res === TestResult.FAIL ? 1 : 0;
                        fullResults.ERROR += res === TestResult.ERROR ? 1 : 0;
                    });
                }));
                yield Promise.allSettled(promises);
                logResult(module.default.name, fileResults);
                yield test.teardown();
            }
        }), { step: true, filter: (p) => p.endsWith('.js') });
        logResult('Final', fullResults);
    });
}
exports.RunTests = RunTests;
;
//# sourceMappingURL=TestRunner.js.map