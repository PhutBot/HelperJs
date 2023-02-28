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
import { Test, Unroll } from "../../src/Test/decorators/index.js";
import { request, SimpleServer } from "../../src/Https/index.js";
import { RequestMapping } from "../../src/Https/decorators/index.js";
import { rString } from "../../src/Rand.js";
import { Middleware, MiddlewareStage } from "../../src/Https/Middleware.js";
import { LogLevel } from "../../src/Log.js";
export default class SimpleServerTest extends TestCase {
    constructor() {
        super(...arguments);
        this.portItr = 10000;
    }
    before(testcase) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new SimpleServer({ port: this.portItr++, loglevel: LogLevel.SILENT });
            yield server.start();
            return { server };
        });
    }
    after(testcase, context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield context.server.stop();
        });
    }
    settings(_) {
        const server = new SimpleServer({ port: 9999, loglevel: LogLevel.SILENT });
        assert.strictEqual(server.hostname, '0.0.0.0');
        assert.strictEqual(server.port, 9999);
        assert.strictEqual(server.address, 'http://0.0.0.0:9999');
    }
    handlers({ context, method, path, statusCode, expect }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method,
                hostname: context.server.hostname,
                port: context.server.port,
                uri: path,
            };
            context.server.defineHandler(method, path, () => __awaiter(this, void 0, void 0, function* () { return ({ statusCode, body: expect }); }));
            let response = yield request(requestObj);
            const body = yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, statusCode);
            assert.strictEqual(body, expect);
            context.server.removeHandler(method, path);
            response = yield request(requestObj);
            assert.strictEqual(response.statusCode, 404);
        });
    }
    error404({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/error404'
            };
            let response = yield request(requestObj);
            yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 404);
        });
    }
    error500({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/error500'
            };
            context.server.defineHandler(requestObj.method, requestObj.uri, () => __awaiter(this, void 0, void 0, function* () { throw 'error'; }));
            let response = yield request(requestObj);
            yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 500);
        });
    }
    requestMapping({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'PUT',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/request/mapping/test'
            };
            context.server.mapHandler(Mapping);
            let response = yield request(requestObj);
            const body = yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(body, 'request mapping test');
            context.server.unmapHandler(Mapping);
            response = yield request(requestObj);
            assert.strictEqual(response.statusCode, 404);
        });
    }
    dirMapping200({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/dir'
            };
            const requestObj2 = Object.assign(Object.assign({}, requestObj), { uri: `${requestObj.uri}/index.html` });
            const expect = '<html><head><title>TestHomePage!</title></head><body><h1>Welcometothephuthub!</h1></body></html>';
            context.server.mapDirectory('./test/www', { alias: requestObj.uri });
            let response = yield request(requestObj);
            let body = yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(body, expect);
            response = yield request(requestObj2);
            body = yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(body, expect);
            response = yield request(Object.assign(Object.assign({}, requestObj), { uri: `/dir/${rString(32)}` }));
            assert.strictEqual(response.statusCode, 404);
            context.server.unmapDirectory(requestObj.uri);
            response = yield request(requestObj);
            assert.strictEqual(response.statusCode, 404);
            response = yield request(requestObj2);
            assert.strictEqual(response.statusCode, 404);
        });
    }
    dirMapping404({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: `/dir/${rString(32)}`
            };
            context.server.mapDirectory('./www', { alias: '/dir' });
            let response = yield request(requestObj);
            assert.strictEqual(response.statusCode, 404);
        });
    }
    serverStartAndStop(_) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new SimpleServer({ port: 9000, loglevel: LogLevel.SILENT });
            assert.ok(!server.running);
            yield server.start();
            assert.ok(server.running);
            yield assert.rejects(server.start(), {
                message: 'server already started'
            });
            yield server.stop();
            assert.ok(!server.running);
            yield assert.rejects(server.stop(), {
                message: 'server already stopped'
            });
        });
    }
    preMiddleware({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            context.server.addMiddleware(new PreMiddleware('custom-model-key', 'custom-model-value'));
            const requestObj = {
                protocol: 'HTTP',
                method: 'PUT',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/middleware/test'
            };
            let value;
            context.server.defineHandler(requestObj.method, requestObj.uri, (_, model) => __awaiter(this, void 0, void 0, function* () {
                value = model['custom-model-key'];
                return { statusCode: 200, body: 'content' };
            }));
            let response = yield request(requestObj);
            const body = yield (yield response.body()).text();
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(body, 'content');
            assert.strictEqual(value, 'custom-model-value');
        });
    }
    postMiddleware({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            context.server.addMiddleware(new PostMiddleware('REPLACE_ME', 'NEW_VALUE'));
            const requestObj = {
                protocol: 'HTTP',
                method: 'PUT',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: '/middleware/test'
            };
            context.server.defineHandler(requestObj.method, requestObj.uri, (_, model) => __awaiter(this, void 0, void 0, function* () {
                return { statusCode: 200, body: 'REPLACE_ME' };
            }));
            let response = yield request(requestObj);
            assert.strictEqual(response.statusCode, 200);
            const body = yield (yield response.body()).text();
            assert.strictEqual(body, 'NEW_VALUE');
        });
    }
}
__decorate([
    Test()
], SimpleServerTest.prototype, "settings", null);
__decorate([
    Unroll([
        { method: 'DELETE', path: '/delete', statusCode: 200, expect: 'content' },
        { method: 'GET', path: '/get', statusCode: 200, expect: 'content' },
        { method: 'PATCH', path: '/patch', statusCode: 200, expect: 'content' },
        { method: 'POST', path: '/post', statusCode: 200, expect: 'content' },
        { method: 'PUT', path: '/put', statusCode: 200, expect: 'content' },
    ])
], SimpleServerTest.prototype, "handlers", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "error404", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "error500", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "requestMapping", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "dirMapping200", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "dirMapping404", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "serverStartAndStop", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "preMiddleware", null);
__decorate([
    Test()
], SimpleServerTest.prototype, "postMiddleware", null);
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
    RequestMapping({ method: 'PUT', location: '/test' })
], Mapping, "test", null);
Mapping = __decorate([
    RequestMapping({ location: '/request/mapping' })
], Mapping);
class PreMiddleware extends Middleware {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
    get stage() { return MiddlewareStage.PRE_PROCESSOR; }
    ;
    process(model) {
        model[this.key] = this.value;
    }
}
class PostMiddleware extends Middleware {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
    get stage() { return MiddlewareStage.POST_PROCESSOR; }
    ;
    process(model, response) {
        var _a;
        if (!!response && typeof (response === null || response === void 0 ? void 0 : response.body) === 'string')
            response.body = (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.replace(this.key, this.value);
    }
}
//# sourceMappingURL=SimpleServer.test.js.map