const ControlChars = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};

export enum LogLevel {
    SILLY,
    VERBOSE,
    INFO,
    HTTP,
    WARN,
    ERROR,
    FATAL,
    SILENT
}

const levelInfo = [
    { name: '  silly', color: ControlChars.BgCyan },
    { name: 'verbose', color: ControlChars.BgCyan },
    { name: '   info', color: ControlChars.FgGreen },
    { name: '   http', color: ControlChars.FgCyan },
    { name: 'warning', color: ControlChars.FgYellow },
    { name: '  error', color: ControlChars.FgRed },
    { name: '  fatal', color: ControlChars.BgRed + ControlChars.FgBlack },
    { name: ' silent', color: ControlChars.FgWhite },
]

export class Logger {
    private level = LogLevel.INFO;
    private heading?:Function|string;

    constructor(heading?:boolean|Function|string) {
        if (heading instanceof Function || typeof heading === 'string')
            this.heading = heading;
        else if (!!heading)
            this.heading = () => new Date().toISOString();
    }

    private printPrefix(text:string) {
        return !text ? "" : `${ControlChars.FgMagenta}${text} `;
    }

    private printLevel(level:LogLevel) {
        const info = levelInfo[level];
        return `${info.color}${info.name}${ControlChars.Reset}`;
    }

    private printHeading() {
        const heading = !this.heading ? ""
            : (this.heading instanceof Function ? this.heading() : this.heading) + " ";
        return ControlChars.FgBlue + heading + ControlChars.Reset;
    }

    public setLevel(level:LogLevel) {
        this.level = level;
    }

    public log(level:LogLevel, prefix:string, message:string, ...args:any[]) {
        if (level < this.level)
            return;
        console.log(`${this.printHeading()}${this.printLevel(level)} ${this.printPrefix(prefix)}${ControlChars.FgWhite}${message}${ControlChars.Reset}`, ...args);
    }

    public silly(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.SILLY, prefix, message, args);
    }

    public verbose(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.VERBOSE, prefix, message);
    }

    public info(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.INFO, prefix, message);
    }

    public http(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.HTTP, prefix, message);
    }

    public warn(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.WARN, prefix, message);
    }

    public error(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.ERROR, prefix, message);
    }

    public fatal(prefix:string, message:string, ...args:any[]) {
        this.log(LogLevel.FATAL, prefix, message);
    }
};

export const DefaultLogger = new Logger(true);
DefaultLogger.setLevel(LogLevel.INFO);
