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
const assert_1 = __importDefault(require("assert"));
const TestCase_1 = require("../../src/Test/TestCase");
const decorators_1 = require("../../src/Test/decorators");
const Https_1 = require("../../src/Https");
const decorators_2 = require("../../src/Https/decorators");
class SimpleServerTest extends TestCase_1.TestCase {
    constructor() {
        super(...arguments);
        this.server = new Https_1.SimpleServer({ port: 9999, loglevel: 'silent' });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.start();
        });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.stop();
        });
    }
    settings() {
        (0, assert_1.default)(this.server.hostname === '0.0.0.0');
        (0, assert_1.default)(this.server.port === 9999);
        (0, assert_1.default)(this.server.address === 'http://0.0.0.0:9999');
    }
    handlers({ method, path, statusCode, expect }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.defineHandler(method, path, () => __awaiter(this, void 0, void 0, function* () { return ({ statusCode, body: expect }); }));
            let response = yield (0, Https_1.request)({
                protocol: 'HTTP',
                method,
                hostname: this.server.hostname,
                port: this.server.port,
                uri: path
            });
            (0, assert_1.default)(response.statusCode === statusCode);
            const body = yield (yield response.body()).text();
            (0, assert_1.default)(body === expect);
            this.server.removeHandler(method, path);
            response = yield (0, Https_1.request)({
                protocol: 'HTTP',
                method,
                hostname: this.server.hostname,
                port: this.server.port,
                uri: path
            });
            (0, assert_1.default)(response.statusCode === 404);
        });
    }
    serverStartAndStop() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new Https_1.SimpleServer({ port: 9000, loglevel: 'silent' });
            (0, assert_1.default)(!server.running);
            yield server.start();
            (0, assert_1.default)(server.running);
            yield this.expectError('server already started', server.start, server);
            yield server.stop();
            (0, assert_1.default)(!server.running);
            yield this.expectError('server already stopped', server.stop, server);
        });
    }
}
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "settings", null);
__decorate([
    (0, decorators_1.Unroll)([
        { method: 'DELETE', path: '/delete', statusCode: 200, expect: 'content' },
        { method: 'GET', path: '/get', statusCode: 200, expect: 'content' },
        { method: 'PATCH', path: '/patch', statusCode: 200, expect: 'content' },
        { method: 'POST', path: '/post', statusCode: 200, expect: 'content' },
        { method: 'PUT', path: '/put', statusCode: 200, expect: 'content' },
    ])
], SimpleServerTest.prototype, "handlers", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "serverStartAndStop", null);
exports.default = SimpleServerTest;
let Mapping = class Mapping {
};
Mapping = __decorate([
    (0, decorators_2.RequestMapping)({})
], Mapping);
//# sourceMappingURL=SimpleServerTest.js.map