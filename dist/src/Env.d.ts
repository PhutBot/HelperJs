export declare class Env {
    static modified: boolean;
    static vars: Array<string>;
    static filename?: string;
    static get(name: string): string | undefined;
    static set(name: string, value: string): void;
    static load(file: string): void;
    static save(): void;
    static waitForVar(name: string, timeout?: number): Promise<unknown>;
}
export declare class EnvBackedValue {
    private key;
    private static saveTimeout?;
    constructor(key: string);
    get(): string | undefined;
    set(val: string): void;
}
