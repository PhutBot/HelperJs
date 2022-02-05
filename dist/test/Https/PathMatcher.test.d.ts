import { TestCase } from "../../src/Test/TestCase";
export default class PathMatcherTest extends TestCase {
    match({ pattern, path, isWild, isDynamic, vars }: any): void;
    notMatch({ pattern, path, isWild, isDynamic }: any): void;
}
