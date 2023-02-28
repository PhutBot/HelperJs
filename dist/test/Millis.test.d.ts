import { TestCase } from "../src/Test/TestCase.js";
export default class EnvTest extends TestCase {
    readonly filename = "./.env";
    from({ unit, amount, expected }: any): void;
    to({ unit, amount, expected }: any): void;
    elapsedToString({ elapsed, fmt, expected }: any): void;
}
//# sourceMappingURL=Millis.test.d.ts.map