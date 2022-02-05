import { TestCase } from "../src/Test/TestCase";
export default class EnvTest extends TestCase {
    readonly filename = "./.env";
    getEnv({ key, val }: any): void;
    setEnv({ key, val }: any): void;
    getBackedValue({ key, val }: any): void;
    setBackedValue({ key, val }: any): void;
    getBackedValueDefault({ key, val }: any): void;
    getBackedValueAsBool({ key, val, expect }: any): void;
    getBackedValueAsInt({ key, val, expect }: any): void;
    getBackedValueAsFloat({ key, val, expect }: any): void;
    getBackedValueAsNan({ key }: any): void;
    wait({ key, val, timeout }: any): Promise<void>;
    timeout({ key, timeout }: any): Promise<void>;
}
