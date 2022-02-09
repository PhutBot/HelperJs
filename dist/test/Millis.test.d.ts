import { TestCase } from "../src/Test/TestCase";
export default class EnvTest extends TestCase {
    readonly filename = "./.env";
    from({ unit, amount, expected }: any): void;
    to({ unit, amount, expected }: any): void;
    elapsedToString({ elapsed, fmt, expected }: any): void;
}
