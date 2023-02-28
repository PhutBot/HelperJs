var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'fs';
import * as path from 'path';
import { DefaultLogger, LogLevel } from "../Log.js";
import { getMetadata } from "../Meta/Metadata.js";
import { TestCase } from "./TestCase.js";
;
export var TestResult;
(function (TestResult) {
    TestResult["PASS"] = "PASS";
    TestResult["FAIL"] = "FAIL";
    TestResult["ERROR"] = "ERROR";
    TestResult["_TOTAL"] = "TOTAL";
})(TestResult || (TestResult = {}));
function walk(dir, action, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs.statSync(dir).isDirectory()) {
            const files = !options.filter
                ? fs.readdirSync(dir)
                : fs.readdirSync(dir).filter((p) => {
                    return fs.statSync(path.join(dir, p)).isDirectory()
                        || options.filter(p);
                });
            for (const file of files) {
                if (options.step)
                    yield walk(path.join(dir, file), action, options);
                else
                    walk(path.join(dir, file), action, options);
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
    const level = result.PASS != result.TOTAL ? LogLevel.WARN : LogLevel.INFO;
    DefaultLogger.log(level, prefix, '----------------------------------------------------------------');
    DefaultLogger.log(level, prefix, `Results: ${JSON.stringify(result, null, spaces)}`);
    DefaultLogger.log(level, prefix, '----------------------------------------------------------------');
    DefaultLogger.info('', '');
}
export function RunTests(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const root = process.cwd();
        const fullResults = {
            TOTAL: 0,
            PASS: 0,
            FAIL: 0,
            ERROR: 0
        };
        yield walk(dir, (filePath) => __awaiter(this, void 0, void 0, function* () {
            if (filePath === `${dir}/index.js`)
                return;
            const location = path.join(root, filePath);
            const module = yield import(location);
            if (!!module.default && module.default.prototype instanceof TestCase) {
                const fileResults = {
                    TOTAL: 0,
                    PASS: 0,
                    FAIL: 0,
                    ERROR: 0
                };
                const test = new module.default();
                yield test.setup();
                const promises = Object.values(Object.getOwnPropertyDescriptors(module.default.prototype))
                    .filter((desc) => !!getMetadata(desc.value, '@Test') || !!getMetadata(desc.value, '@Unroll'))
                    .map((desc) => __awaiter(this, void 0, void 0, function* () {
                    const result = yield desc.value.apply(test);
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
;
//# sourceMappingURL=TestRunner.js.map