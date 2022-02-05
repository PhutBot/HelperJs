import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { test, unroll } from "../../src/Test/decorators";
import { request, SimpleServer } from "../../src/Https";
import npmlog from "npmlog";

export default class SimpleServerTest extends TestCase {
    private server = new SimpleServer({ port: 9999 });

    async setup() {
        await this.server.start();
    }
    
    async teardown() {
        await this.server.stop();
    }

    @test()
    settings() {
        assert(this.server.hostname === '0.0.0.0');
        assert(this.server.port === 9999);
        assert(this.server.address === 'http://0.0.0.0:9999');
    }

    @unroll([
        { method: 'DELETE', path: '/delete', statusCode: 200, expect: 'content' },
        { method: 'GET',    path: '/get',    statusCode: 200, expect: 'content' },
        { method: 'PATCH',  path: '/patch',  statusCode: 200, expect: 'content' },
        { method: 'POST',   path: '/post',   statusCode: 200, expect: 'content' },
        { method: 'PUT',    path: '/put',    statusCode: 200, expect: 'content' },
    ])
    async handlers({ method, path, statusCode, expect }:any) {
        this.server.defineHandler(method, path, async () => ({ statusCode, body: expect }));
        let response = await request({
            protocol: 'HTTP',
            method,
            hostname: this.server.hostname,
            port: this.server.port,
            uri: path
        });
        assert(response.statusCode === statusCode);

        const body = await (await response.body()).text();
        assert(body === expect);
        
        this.server.removeHandler(method, path);
        response = await request({
            protocol: 'HTTP',
            method,
            hostname: this.server.hostname,
            port: this.server.port,
            uri: path
        });
        assert(response.statusCode === 404);
    }

    @test()
    async serverStartAndStop() {
        const server = new SimpleServer({ port: 9000 });
        assert(!server.running);

        await server.start();
        assert(server.running);
        await this.expectError('server already started', server.start, server);

        await server.stop();
        assert(!server.running);
        await this.expectError('server already stopped', server.stop, server);
    }
}
