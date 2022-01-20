export declare function get(name: string, def?: string): string | undefined;
export declare function set(name: string, value: string): void;
export declare function load(file: string): void;
export declare function save(): void;
export declare function waitForVar(name: string, timeout?: number): Promise<unknown>;
export declare class EnvBackedValue {
    static timeout: number;
    private static saveTimeout?;
    private key;
    private def?;
    constructor(key: string, def?: string);
    get(): string | undefined;
    asBool(): boolean;
    asInt(): number;
    asFloat(): number;
    set(val: string): void;
}
