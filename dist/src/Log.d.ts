export declare enum LogLevel {
    SILLY = 0,
    VERBOSE = 1,
    INFO = 2,
    HTTP = 3,
    WARN = 4,
    ERROR = 5,
    FATAL = 6,
    SILENT = 7
}
type StringGenerator = () => string;
export declare class Logger {
    private level;
    private heading?;
    private prefix?;
    constructor(prefix?: StringGenerator | string, heading?: boolean | StringGenerator | string);
    private printPrefix;
    private printLevel;
    setLevel(level: LogLevel): void;
    log(level: LogLevel, message: string, ...args: any[]): void;
    silly(message: string, ...args: any[]): void;
    verbose(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    http(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    fatal(message: string, ...args: any[]): void;
}
export declare const DefaultLogger: Logger;
export {};
//# sourceMappingURL=Log.d.ts.map