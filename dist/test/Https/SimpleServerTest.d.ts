import { TestCase } from "../../src/Test/TestCase";
export default class SimpleServerTest extends TestCase {
    private server;
    setup(): Promise<void>;
    teardown(): Promise<void>;
    settings(): void;
    handlers({ method, path, statusCode, expect }: any): Promise<void>;
    requestMapping(): Promise<void>;
    dirMapping(): Promise<void>;
    serverStartAndStop(): Promise<void>;
}
