import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { Test, Unroll } from "../../src/Test/decorators";
import { request, SimpleServer } from "../../src/Https";
import { RequestMapping } from "../../src/Https/decorators";

export default class SimpleServerTest extends TestCase {
    private server = new SimpleServer({ port: 9999, loglevel: 'silent' });

    async setup() {
        await this.server.start();
    }
    
    async teardown() {
        await this.server.stop();
    }

    @Test()
    settings() {
        assert.strictEqual(this.server.hostname, '0.0.0.0');
        assert.strictEqual(this.server.port, 9999);
        assert.strictEqual(this.server.address, 'http://0.0.0.0:9999');
    }

    @Unroll([
        { method: 'DELETE', path: '/delete', statusCode: 200, expect: 'content' },
        { method: 'GET',    path: '/get',    statusCode: 200, expect: 'content' },
        { method: 'PATCH',  path: '/patch',  statusCode: 200, expect: 'content' },
        { method: 'POST',   path: '/post',   statusCode: 200, expect: 'content' },
        { method: 'PUT',    path: '/put',    statusCode: 200, expect: 'content' },
    ])
    async handlers({ method, path, statusCode, expect }:any) {
        const requestObj = {
            protocol: 'HTTP',
            method,
            hostname: this.server.hostname,
            port: this.server.port,
            uri: path
        };

        this.server.defineHandler(method, path, async () => ({ statusCode, body: expect }));
        let response = await request(requestObj);
        const body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, statusCode);
        assert.strictEqual(body, expect);
        
        this.server.removeHandler(method, path);
        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async requestMapping() {
        const requestObj = {
            protocol: 'HTTP',
            method: 'PUT',
            hostname: this.server.hostname,
            port: this.server.port,
            uri: '/request/mapping/test'
        };

        this.server.mapHandler(Mapping);
        let response = await request(requestObj);
        const body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, 'request mapping test');

        this.server.unmapHandler(Mapping);
        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async dirMapping() {
        const requestObj = {
            protocol: 'HTTP',
            method: 'GET',
            hostname: this.server.hostname,
            port: this.server.port,
            uri: '/dir'
        };
        const requestObj2 = { ...requestObj, uri: '/dir/index.html' };
        const expect = '<html><head><title>TestHomePage!</title></head><body><h1>Welcometothephuthub!</h1></body></html>';

        this.server.mapDirectory('./www', { alias: '/dir' });

        let response = await request(requestObj);
        let body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, expect);

        response = await request(requestObj2);
        body = await (await response.body()).text();
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, expect);

        this.server.unmapDirectory('/dir');

        response = await request(requestObj);
        assert.strictEqual(response.statusCode, 404);
        
        response = await request(requestObj2);
        assert.strictEqual(response.statusCode, 404);
    }

    @Test()
    async serverStartAndStop() {
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