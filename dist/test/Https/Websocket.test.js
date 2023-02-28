var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as assert from 'assert';
import { TestCase } from "../../src/Test/TestCase.js";
import { Test } from "../../src/Test/decorators/index.js";
import { SimpleServer, WebSocketClient, WebsocketOpcode } from "../../src/Https/index.js";
import { LogLevel } from "../../src/Log.js";
import { sleep } from "../../src/Millis.js";
export default class WebSocketTest extends TestCase {
    constructor() {
        super(...arguments);
        this.server = new SimpleServer({ port: 9999, loglevel: LogLevel.SILENT });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.defineHandler('GET', '/ws', (_) => __awaiter(this, void 0, void 0, function* () {
                return {
                    statusCode: 101
                };
            }));
            yield this.server.start();
        });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.stop();
        });
    }
    websocket(_) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sleep(100);
            const ws = new WebSocketClient(`http://127.0.0.1:${this.server.port}/ws`);
            this.server.addEventListener('simple-websocket-msg', ({ detail }) => {
                assert.equal(detail.data, 'hello, world');
            });
            yield sleep(100);
            ws.write(WebsocketOpcode.TEXT, "hello, world");
            yield sleep(100);
        });
    }
}
__decorate([
    Test()
], WebSocketTest.prototype, "websocket", null);
//# sourceMappingURL=Websocket.test.js.map