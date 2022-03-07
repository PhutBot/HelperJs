export declare class TestCase {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    before(testcase: string): Promise<void>;
    after(testcase: string): Promise<void>;
}
