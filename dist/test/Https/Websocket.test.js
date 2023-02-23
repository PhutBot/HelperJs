"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestCase_1 = require("../../src/Test/TestCase");
const decorators_1 = require("../../src/Test/decorators");
const Https_1 = require("../../src/Https");
const Log_1 = require("../../src/Log");
const Millis_1 = require("../../src/Millis");
const assert_1 = __importDefault(require("assert"));
class WebSocketTest extends TestCase_1.TestCase {
    constructor() {
        super(...arguments);
        this.server = new Https_1.SimpleServer({ port: 9999, loglevel: Log_1.LogLevel.SILENT });
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
            yield (0, Millis_1.sleep)(100);
            const ws = new Https_1.WebSocketClient(`http://127.0.0.1:${this.server.port}/ws`);
            this.server.addEventListener('simple-websocket-msg', ({ detail }) => {
                assert_1.default.equal(detail.data, 'hello, world');
            });
            yield (0, Millis_1.sleep)(100);
            ws.write(Https_1.WebsocketOpcode.TEXT, "hello, world");
            yield (0, Millis_1.sleep)(100);
        });
    }
}
__decorate([
    (0, decorators_1.Test)()
], WebSocketTest.prototype, "websocket", null);
exports.default = WebSocketTest;
//# sourceMappingURL=Websocket.test.js.map