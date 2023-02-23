import * as fs from "fs";
import path from "path";
import { DefaultLogger, LogLevel } from "../Log";
import { getMetadata } from "../Meta/Metadata";
import { TestCase } from "./TestCase";

interface WalkOptions {
    filter?:(p:string)=>boolean;
    step:boolean;
};

export enum TestResult {
    PASS = 'PASS',
    FAIL = 'FAIL',
    ERROR = 'ERROR',
    _TOTAL = 'TOTAL',
}

async function walk(dir:string, action:(p:string)=>any, options:WalkOptions) {
    if (fs.statSync(dir).isDirectory()) {
        const files = !options.filter
            ? fs.readdirSync(dir)
            : fs.readdirSync(dir).filter((p) => {
                return fs.statSync(path.join(dir, p)).isDirectory()
                    || options.filter!(p);
            });
        for (const file of files) {
            if (options.step) await walk(path.join(dir, file), action, options);
            else walk(path.join(dir, file), action, options);
        }
    } else {
        if (options.step) await action(dir);
        else action(dir);
    }
}

function logResult(prefix:string, result:Record<TestResult,number>, spaces=0) {
    const level = result.PASS != result.TOTAL ? LogLevel.WARN : LogLevel.INFO;
    DefaultLogger.log(level, prefix, '----------------------------------------------------------------');
    DefaultLogger.log(level, prefix, `Results: ${JSON.stringify(result, null, spaces)}`);
    DefaultLogger.log(level, prefix, '----------------------------------------------------------------');
    DefaultLogger.info('','');
}

export async function RunTests(dir:string) {
    const root = process.cwd();
    const fullResults:Record<TestResult,number> = {
        TOTAL: 0,
        PASS: 0,
        FAIL: 0,
        ERROR: 0
    };

    await walk(dir, async (filePath:string) => {
        if (filePath === `${dir}/index.js`)
            return;

        const location = path.join(root, filePath);
        const module = await import(location);
        if (!!module.default && module.default.prototype instanceof TestCase) {
            const fileResults:Record<TestResult,number> = {
                TOTAL: 0,
                PASS: 0,
                FAIL: 0,
                ERROR: 0
            };
            
            const test = new module.default();
            await test.setup();
            
            const promises = Object.values(Object.getOwnPropertyDescriptors(module.default.prototype))
                .filter((desc) => !!getMetadata(desc.value, '@Test') || !!getMetadata(desc.value, '@Unroll'))
                .map(async (desc) => {
                    const result = await desc.value.apply(test);
                    
                    result.forEach((res:TestResult) => {
                        fileResults.TOTAL += 1;
                        fileResults.PASS += res === TestResult.PASS ? 1 : 0;
                        fileResults.FAIL += res === TestResult.FAIL ? 1 : 0;
                        fileResults.ERROR += res === TestResult.ERROR ? 1 : 0;

                        fullResults.TOTAL += 1;
                        fullResults.PASS += res === TestResult.PASS ? 1 : 0;
                        fullResults.FAIL += res === TestResult.FAIL ? 1 : 0;
                        fullResults.ERROR += res === TestResult.ERROR ? 1 : 0;
                    });
                });
                
            await Promise.allSettled(promises);
            logResult(module.default.name, fileResults);
            await test.teardown();
        }
    }, { step: true, filter: (p:string) => p.endsWith('.js') });

    logResult('Final', fullResults);
};
