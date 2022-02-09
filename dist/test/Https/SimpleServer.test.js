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
        assert_1.default.strictEqual(this.server.hostname, '0.0.0.0');
        assert_1.default.strictEqual(this.server.port, 9999);
        assert_1.default.strictEqual(this.server.address, 'http://0.0.0.0:9999');
    }
    handlers({ method, path, statusCode, expect }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method,
                hostname: this.server.hostname,
                port: this.server.port,
                uri: path
            };
            this.server.defineHandler(method, path, () => __awaiter(this, void 0, void 0, function* () { return ({ statusCode, body: expect }); }));
            let response = yield (0, Https_1.request)(requestObj);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, statusCode);
            assert_1.default.strictEqual(body, expect);
            this.server.removeHandler(method, path);
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
        });
    }
    requestMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'PUT',
                hostname: this.server.hostname,
                port: this.server.port,
                uri: '/request/mapping/test'
            };
            this.server.mapHandler(Mapping);
            let response = yield (0, Https_1.request)(requestObj);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, 'request mapping test');
            this.server.unmapHandler(Mapping);
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
        });
    }
    dirMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: this.server.hostname,
                port: this.server.port,
                uri: '/dir'
            };
            const requestObj2 = Object.assign(Object.assign({}, requestObj), { uri: '/dir/index.html' });
            const expect = '<html><head><title>TestHomePage!</title></head><body><h1>Welcometothephuthub!</h1></body></html>';
            this.server.mapDirectory('./www', { alias: '/dir' });
            let response = yield (0, Https_1.request)(requestObj);
            let body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, expect);
            response = yield (0, Https_1.request)(requestObj2);
            body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, expect);
            this.server.unmapDirectory('/dir');
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
            response = yield (0, Https_1.request)(requestObj2);
            assert_1.default.strictEqual(response.statusCode, 404);
        });
    }
    serverStartAndStop() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new Https_1.SimpleServer({ port: 9000, loglevel: 'silent' });
            assert_1.default.ok(!server.running);
            yield server.start();
            assert_1.default.ok(server.running);
            yield assert_1.default.rejects(server.start(), {
                message: 'server already started'
            });
            yield server.stop();
            assert_1.default.ok(!server.running);
            yield assert_1.default.rejects(server.stop(), {
                message: 'server already stopped'
            });
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
], SimpleServerTest.prototype, "requestMapping", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "dirMapping", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "serverStartAndStop", null);
exports.default = SimpleServerTest;
let Mapping = class Mapping {
    static test() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                statusCode: 200,
                body: 'request mapping test'
            };
        });
    }
};
__decorate([
    (0, decorators_2.RequestMapping)({ method: 'PUT', location: '/test' })
], Mapping, "test", null);
Mapping = __decorate([
    (0, decorators_2.RequestMapping)({ location: '/request/mapping' })
], Mapping);
//# sourceMappingURL=SimpleServer.test.js.map