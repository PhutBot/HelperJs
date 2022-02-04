import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { test } from "../../src/Test/decorators";

export default class SimpleServerTest extends TestCase {
    @test()
    test() {}
}
