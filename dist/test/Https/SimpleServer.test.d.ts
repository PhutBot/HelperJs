import { TestCase } from "../../src/Test/TestCase.js";
import { SimpleServer } from "../../src/Https/index.js";
export default class SimpleServerTest extends TestCase {
    private portItr;
    before(testcase: string): Promise<{
        server: SimpleServer;
    }>;
    after(testcase: string, context: any): Promise<void>;
    settings(_: any): void;
    handlers({ context, method, path, statusCode, expect }: any): Promise<void>;
    error404({ context }: any): Promise<void>;
    error500({ context }: any): Promise<void>;
    requestMapping({ context }: any): Promise<void>;
    dirMapping200({ context }: any): Promise<void>;
    dirMapping404({ context }: any): Promise<void>;
    serverStartAndStop(_: any): Promise<void>;
    preMiddleware({ context }: any): Promise<void>;
    postMiddleware({ context }: any): Promise<void>;
}
//# sourceMappingURL=SimpleServer.test.d.ts.map