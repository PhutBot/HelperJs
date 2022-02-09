export declare class TestCase {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    before(): Promise<void>;
    after(): Promise<void>;
}
