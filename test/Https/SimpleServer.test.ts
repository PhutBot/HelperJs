import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { Test, Unroll } from "../../src/Test/decorators";
import { HandlerResponse, HttpRequest, request, SimpleServer } from "../../src/Https";
import { RequestMapping } from "../../src/Https/decorators";
import { rString } from "../../src/Rand";
import { Middleware, MiddlewareStage } from "../../src/Https/Middleware";

export default class SimpleServerTest extends TestCase {
    private portItr = 10000;

    async before(testcase:string) {
        const server = new SimpleServer({ port: this.portItr++, loglevel: 'silent' });
        await server.start();
        return { server };
    }

    async after(testcase:string, context:any) {
        await context.server.stop();
    }

    @Test()
    settings(_:any) {
        const server = new SimpleServer({ port: 9999, loglevel: 'silent' });
        assert.strictEqual(server.hostname, '0.0.0.0');
        assert.strictEqual(server.port, 9999);
        assert.strictEqual(server.address, 'http://0.0.0.0:9999');
    }

    @Unroll([
        { method: 'DELETE', path: '/delete', statusCode: 200, expect: 'content' },
        { method: 'GET',    path: '/get',    statusCode: 200, expect: 'content' },
        { method: 'PATCH',  path: '/patch',  statusCode: 200, expect: 'content' },
        { method: 'POST',   path: '/post',   statusCode: 200, expect: 'content' },
        { method: 'PUT',    path: '/put',    statusCode: 200, expect: 'content' },
    ])
    async handlers({ context, method, path, statusCode, expect }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method,
            hostname: context.server.hostname,
            port: context.server.port,
            uri: path
        };

        context.server.defineHandler(method, path, async () => ({ statusCode, body: expect }));
        let response = await request(requestObj);
        const body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, statusCode);
        assert.strictEqual(body, expect);
        
        context.server.removeHandler(method, path);
        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async error404({ context }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method: 'GET',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/error404'
        };

        let response = await request(requestObj);
        await (await response.body()).text();
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async error500({ context }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method: 'GET',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/error500'
        };

        context.server.defineHandler(requestObj.method, requestObj.uri, async () => { throw 'error'; });
        let response = await request(requestObj);
        await (await response.body()).text();
        assert.strictEqual(response.statusCode, 500);
    }

    @Test()
    async requestMapping({ context }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method: 'PUT',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/request/mapping/test'
        };

        context.server.mapHandler(Mapping);
        let response = await request(requestObj);
        const body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, 'request mapping test');

        context.server.unmapHandler(Mapping);
        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async dirMapping200({ context }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method: 'GET',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/dir'
        };
        const requestObj2 = { ...requestObj, uri: `${requestObj.uri}/index.html` };
        const expect = '<html><head><title>TestHomePage!</title></head><body><h1>Welcometothephuthub!</h1></body></html>';

        context.server.mapDirectory('../../test/www', { alias: requestObj.uri });

        let response = await request(requestObj);
        let body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, expect);

        response = await request(requestObj2);
        body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, expect);

        response = await request({...requestObj, uri: `/dir/${rString(32)}`});
        assert.strictEqual(response.statusCode, 404);

        context.server.unmapDirectory(requestObj.uri);

        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
        
        response = await request(requestObj2);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async dirMapping404({ context }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method: 'GET',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: `/dir/${rString(32)}`
        };

        context.server.mapDirectory('./www', { alias: '/dir' });

        let response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async serverStartAndStop(_:any) {
        const server = new SimpleServer({ port: 9000, loglevel: 'silent' });
        assert.ok(!server.running);

        await server.start();
        assert.ok(server.running);
        await assert.rejects(server.start(), {
            message: 'server already started'
        });

        await server.stop();
        assert.ok(!server.running);
        await assert.rejects(server.stop(), {
            message: 'server already stopped'
        });
    }

    @Test()
    async preMiddleware({ context }:any) {
        context.server.addMiddleware(new PreMiddleware('custom-model-key', 'custom-model-value'));

        const requestObj = {
            protocol: 'HTTP',
            method: 'PUT',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/middleware/test'
        };

        let value;
        context.server.defineHandler(requestObj.method, requestObj.uri, async (_:any, model:any) => {
            value = model['custom-model-key'];
            return { statusCode: 200, body: 'content' };
        });
        let response = await request(requestObj);
        const body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, 'content');
        assert.strictEqual(value, 'custom-model-value');
    }

    @Test()
    async postMiddleware({ context }:any) {
        context.server.addMiddleware(new PostMiddleware('REPLACE_ME', 'NEW_VALUE'));

        const requestObj = {
            protocol: 'HTTP',
            method: 'PUT',
            hostname: context.server.hostname,
            port: context.server.port,
            uri: '/middleware/test'
        };

        context.server.defineHandler(requestObj.method, requestObj.uri, async (_:any, model:any) => {
            return { statusCode: 200, body: 'REPLACE_ME' };
        });
        let response = await request(requestObj);
        assert.strictEqual(response.statusCode, 200);
        const body = await (await response.body()).text();
        assert.strictEqual(body, 'NEW_VALUE');
    }
}

@RequestMapping({ location: '/request/mapping' })
class Mapping {
    @RequestMapping({ method: 'PUT', location: '/test' })
    static async test() {
        return {
            statusCode: 200,
            body: 'request mapping test'
        };
    }
}

class PreMiddleware extends Middleware {
    private key:string;
    private value:string;

    constructor(key:string, value:string) {
        super();
        this.key = key;
        this.value = value;
    }

    get stage() { return MiddlewareStage.PRE_PROCESSOR };
    process(model:any) {
        model[this.key] = this.value;
    }
}

class PostMiddleware extends Middleware {
    private key:string;
    private value:string;

    constructor(key:string, value:string) {
        super();
        this.key = key;
        this.value = value;
    }

    get stage() { return MiddlewareStage.POST_PROCESSOR };
    process(model:{}, response?:HandlerResponse) {
        if (!!response && typeof response?.body === 'string')
            response.body = response?.body?.replace(this.key, this.value);
    }
}
