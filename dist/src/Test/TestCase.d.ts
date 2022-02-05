export declare class TestCase {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    before(): Promise<void>;
    after(): Promise<void>;
    assertError(expected: any, func: Function, self?: any, ...args: any): Promise<void>;
}
