import { TestCase } from "../src/Test/TestCase";
export default class EnvTest extends TestCase {
    readonly filename = "./.env";
    before(testcase: string): Promise<void>;
    getEnv({ key, val }: any): void;
    setEnv({ testcase, key, val }: any): void;
    getBackedValue({ key, val }: any): void;
    setBackedValue({ testcase, key, val }: any): void;
    getBackedValueDefault({ testcase, key, val }: any): void;
    getBackedValueAsBool({ testcase, key, val, expect }: any): void;
    getBackedValueAsInt({ testcase, key, val, expect }: any): void;
    getBackedValueAsFloat({ testcase, key, val, expect }: any): void;
    getBackedValueAs({ key, val }: any): void;
    getBackedValueAsNan({ testcase, key }: any): void;
    wait({ testcase, key, val, timeout }: any): Promise<void>;
    timeout({ testcase, key, timeout }: any): Promise<void>;
}
