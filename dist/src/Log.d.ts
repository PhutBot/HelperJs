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
export declare class Logger {
    private level;
    private heading?;
    constructor(heading?: boolean | Function | string);
    private printPrefix;
    private printLevel;
    private printHeading;
    setLevel(level: LogLevel): void;
    log(level: LogLevel, prefix: string, message: string, ...args: any[]): void;
    silly(prefix: string, message: string, ...args: any[]): void;
    verbose(prefix: string, message: string, ...args: any[]): void;
    info(prefix: string, message: string, ...args: any[]): void;
    http(prefix: string, message: string, ...args: any[]): void;
    warn(prefix: string, message: string, ...args: any[]): void;
    error(prefix: string, message: string, ...args: any[]): void;
    fatal(prefix: string, message: string, ...args: any[]): void;
}
export declare const DefaultLogger: Logger;
