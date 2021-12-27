export = Env;
declare class Env {
    static modified: boolean;
    static vars: any[];
    static filename: null;
    static get(name: any): any;
    static set(name: any, value: any): void;
    static load(file: any): void;
    static save(): void;
    static waitForVar(name: any, timeout?: number): Promise<any>;
}
//# sourceMappingURL=Env.d.ts.map