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

type StringGenerator = ()=>string;

export class Logger {
    private level = LogLevel.INFO;
    private heading?: StringGenerator|string;
    private prefix?: StringGenerator|string;

    constructor(prefix?: StringGenerator|string, heading?:boolean|StringGenerator|string) {
        this.prefix = prefix;
        if (heading instanceof Function || typeof heading === 'string')
            this.heading = heading;
        else if (!!heading)
            this.heading = () => new Date().toISOString();
    }

    private printPrefix(color: string, value?: StringGenerator | string) {
        const prefix = !value ? ""
            : (value instanceof Function ? value()
            : value) + " ";
        return color + prefix + ControlChars.Reset;
    }

    private printLevel(level:LogLevel) {
        const info = levelInfo[level];
        return `${info.color}${info.name}${ControlChars.Reset}`;
    }

    public setLevel(level:LogLevel) {
        this.level = level;
    }

    public log(level:LogLevel, message:string, ...args:any[]) {
        if (level < this.level)
            return;
        const msg = this.printPrefix(ControlChars.FgBlue, this.heading)
            + this.printLevel(level) + " "
            + this.printPrefix(ControlChars.FgMagenta, this.prefix)
            + ControlChars.FgWhite
            + message
            + ControlChars.Reset;
        console.log(msg, ...args);
    }

    public silly(message:string, ...args:any[]) {
        this.log(LogLevel.SILLY, message, args);
    }

    public verbose(message:string, ...args:any[]) {
        this.log(LogLevel.VERBOSE, message, args);
    }

    public info(message:string, ...args:any[]) {
        this.log(LogLevel.INFO, message, args);
    }

    public http(message:string, ...args:any[]) {
        this.log(LogLevel.HTTP, message, args);
    }

    public warn(message:string, ...args:any[]) {
        this.log(LogLevel.WARN, message, args);
    }

    public error(message:string, ...args:any[]) {
        this.log(LogLevel.ERROR, message, args);
    }

    public fatal(message:string, ...args:any[]) {
        this.log(LogLevel.FATAL, message, args);
    }
};

export const DefaultLogger = new Logger("DefaultLogger", true);
DefaultLogger.setLevel(LogLevel.INFO);
