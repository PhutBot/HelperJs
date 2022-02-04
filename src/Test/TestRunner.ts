import * as fs from "fs";
import npmlog from "npmlog";
import path from "path";
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
    npmlog.info(prefix, '----------------------------------------------------------------');
    npmlog.info(prefix, `Results: ${JSON.stringify(result, null, spaces)}`);
    npmlog.info(prefix, '----------------------------------------------------------------');
    npmlog.info('','');
}

export async function RunTests(dir:string, root:string="./") {
    const fullResults:Record<TestResult,number> = {
        TOTAL: 0,
        PASS: 0,
        FAIL: 0,
        ERROR: 0
    };

    await walk(dir, async (filePath:string) => {
        if (filePath === `${dir}/index.js`)
            return;

        const module = await import(path.join(root, filePath));
        if (!!module.default && module.default.prototype instanceof TestCase) {
            const fileResults:Record<TestResult,number> = {
                TOTAL: 0,
                PASS: 0,
                FAIL: 0,
                ERROR: 0
            };
            
            const promises = Object.values(Object.getOwnPropertyDescriptors(module.default.prototype))
                .filter(desc => !!getMetadata(desc.value, '@test') || !!getMetadata(desc.value, '@unroll'))
                .map(async (desc) => {
                    try {
                        const test = new module.default();
                        await test.setup();
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
                    } catch (err) {
                        console.error(err);                                
                    }
                });

            await Promise.allSettled(promises);
            logResult(module.default.name, fileResults);
        }
    }, { step: true, filter: (p:string) => p.endsWith('.js') });

    logResult('Final', fullResults);
};
