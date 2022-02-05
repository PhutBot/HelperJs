export declare class Logger {
    readonly loglevel: string;
    constructor(loglevel: string);
    silly(...args: any): void;
    verbose(...args: any): void;
    info(...args: any): void;
    http(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
}
