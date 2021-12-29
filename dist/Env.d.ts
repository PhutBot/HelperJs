export declare function get(name: string): string | undefined;
export declare function set(name: string, value: string): void;
export declare function load(file: string): void;
export declare function save(): void;
export declare function waitForVar(name: string, timeout?: number): Promise<unknown>;
export declare class EnvBackedValue {
    static timeout: number;
    private static saveTimeout?;
    private key;
    constructor(key: string);
    get(): string | undefined;
    asInt(): number;
    asFloat(): number;
    set(val: string): void;
}
