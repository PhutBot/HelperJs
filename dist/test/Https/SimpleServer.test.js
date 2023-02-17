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
const Rand_1 = require("../../src/Rand");
const Middleware_1 = require("../../src/Https/Middleware");
class SimpleServerTest extends TestCase_1.TestCase {
    constructor() {
        super(...arguments);
        this.portItr = 10000;
    }
    before(testcase) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new Https_1.SimpleServer({ port: this.portItr++, loglevel: 'silent' });
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
        const server = new Https_1.SimpleServer({ port: 9999, loglevel: 'silent' });
        assert_1.default.strictEqual(server.hostname, '0.0.0.0');
        assert_1.default.strictEqual(server.port, 9999);
        assert_1.default.strictEqual(server.address, 'http://0.0.0.0:9999');
    }
    handlers({ context, method, path, statusCode, expect }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method,
                hostname: context.server.hostname,
                port: context.server.port,
                uri: path
            };
            context.server.defineHandler(method, path, () => __awaiter(this, void 0, void 0, function* () { return ({ statusCode, body: expect }); }));
            let response = yield (0, Https_1.request)(requestObj);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, statusCode);
            assert_1.default.strictEqual(body, expect);
            context.server.removeHandler(method, path);
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
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
            let response = yield (0, Https_1.request)(requestObj);
            yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 404);
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
            let response = yield (0, Https_1.request)(requestObj);
            yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 500);
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
            let response = yield (0, Https_1.request)(requestObj);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, 'request mapping test');
            context.server.unmapHandler(Mapping);
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
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
            context.server.mapDirectory('../../test/www', { alias: requestObj.uri });
            let response = yield (0, Https_1.request)(requestObj);
            let body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, expect);
            response = yield (0, Https_1.request)(requestObj2);
            body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, expect);
            response = yield (0, Https_1.request)(Object.assign(Object.assign({}, requestObj), { uri: `/dir/${(0, Rand_1.rString)(32)}` }));
            assert_1.default.strictEqual(response.statusCode, 404);
            context.server.unmapDirectory(requestObj.uri);
            response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
            response = yield (0, Https_1.request)(requestObj2);
            assert_1.default.strictEqual(response.statusCode, 404);
        });
    }
    dirMapping404({ context }) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestObj = {
                protocol: 'HTTP',
                method: 'GET',
                hostname: context.server.hostname,
                port: context.server.port,
                uri: `/dir/${(0, Rand_1.rString)(32)}`
            };
            context.server.mapDirectory('./www', { alias: '/dir' });
            let response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 404);
        });
    }
    serverStartAndStop(_) {
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
            let response = yield (0, Https_1.request)(requestObj);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(response.statusCode, 200);
            assert_1.default.strictEqual(body, 'content');
            assert_1.default.strictEqual(value, 'custom-model-value');
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
            let response = yield (0, Https_1.request)(requestObj);
            assert_1.default.strictEqual(response.statusCode, 200);
            const body = yield (yield response.body()).text();
            assert_1.default.strictEqual(body, 'NEW_VALUE');
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
], SimpleServerTest.prototype, "error404", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "error500", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "requestMapping", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "dirMapping200", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "dirMapping404", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "serverStartAndStop", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "preMiddleware", null);
__decorate([
    (0, decorators_1.Test)()
], SimpleServerTest.prototype, "postMiddleware", null);
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
class PreMiddleware extends Middleware_1.Middleware {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
    get stage() { return Middleware_1.MiddlewareStage.PRE_PROCESSOR; }
    ;
    process(model) {
        model[this.key] = this.value;
    }
}
class PostMiddleware extends Middleware_1.Middleware {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
    get stage() { return Middleware_1.MiddlewareStage.POST_PROCESSOR; }
    ;
    process(model, response) {
        var _a;
        if (!!response && typeof (response === null || response === void 0 ? void 0 : response.body) === 'string')
            response.body = (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.replace(this.key, this.value);
    }
}
//# sourceMappingURL=SimpleServer.test.js.map