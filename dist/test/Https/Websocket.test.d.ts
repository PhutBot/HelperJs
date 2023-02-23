import { TestCase } from "../../src/Test/TestCase";
export default class WebSocketTest extends TestCase {
    private server;
    setup(): Promise<void>;
    teardown(): Promise<void>;
    websocket(_: any): Promise<void>;
}
