export declare class TestCase {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    before(): Promise<void>;
    after(): Promise<void>;
    expectError(expect: any, func: Function, self?: any, ...args: any): Promise<void>;
}
