export declare class Logger {
    readonly loglevel: string;
    constructor(loglevel: string);
    silly(prefix: string, message: string, ...args: any[]): void;
    verbose(prefix: string, message: string, ...args: any[]): void;
    info(prefix: string, message: string, ...args: any[]): void;
    http(prefix: string, message: string, ...args: any[]): void;
    warn(prefix: string, message: string, ...args: any[]): void;
    error(prefix: string, message: string, ...args: any[]): void;
}
