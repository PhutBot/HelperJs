export declare class TestCase {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    before(testcase: string): Promise<any>;
    after(testcase: string, ctx: any): Promise<void>;
}
//# sourceMappingURL=TestCase.d.ts.map