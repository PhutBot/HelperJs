import { TestCase } from "../../src/Test/TestCase";
import { Test } from "../../src/Test/decorators";
import { HandlerResponse, SimpleServer, WebSocketClient, WebsocketOpcode } from "../../src/Https";
import { LogLevel } from "../../src/Log";
import { sleep } from "../../src/Millis";
import assert from "assert";

export default class WebSocketTest extends TestCase {
    private server = new SimpleServer({port: 9999, loglevel: LogLevel.SILENT});

    async setup() {
        this.server.defineHandler('GET', '/ws', async (_): Promise<HandlerResponse> => {
            return {
                statusCode: 101
            };
        })
        await this.server.start();
    }

    async teardown() {
        await this.server.stop();
    }

    @Test()
    async websocket(_:any) {
        await sleep(100);
        const ws = new WebSocketClient(`http://127.0.0.1:${this.server.port}/ws`);
        this.server.addEventListener('simple-websocket-msg', ({ detail }:any) => {
            assert.equal(detail.data, 'hello, world');
        });
        await sleep(100);
        ws.write(WebsocketOpcode.TEXT, "hello, world");
        await sleep(100);
    }
}
