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
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["SILLY"] = 0] = "SILLY";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["HTTP"] = 3] = "HTTP";
    LogLevel[LogLevel["WARN"] = 4] = "WARN";
    LogLevel[LogLevel["ERROR"] = 5] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 6] = "FATAL";
    LogLevel[LogLevel["SILENT"] = 7] = "SILENT";
})(LogLevel || (LogLevel = {}));
const levelInfo = [
    { name: '  silly', color: ControlChars.BgCyan },
    { name: 'verbose', color: ControlChars.BgCyan },
    { name: '   info', color: ControlChars.FgGreen },
    { name: '   http', color: ControlChars.FgCyan },
    { name: 'warning', color: ControlChars.FgYellow },
    { name: '  error', color: ControlChars.FgRed },
    { name: '  fatal', color: ControlChars.BgRed + ControlChars.FgBlack },
    { name: ' silent', color: ControlChars.FgWhite },
];
export class Logger {
    constructor(prefix, heading) {
        this.level = LogLevel.INFO;
        this.prefix = prefix;
        if (heading instanceof Function || typeof heading === 'string')
            this.heading = heading;
        else if (!!heading)
            this.heading = () => new Date().toISOString();
    }
    printPrefix(color, value) {
        const prefix = !value ? ""
            : (value instanceof Function ? value()
                : value) + " ";
        return color + prefix + ControlChars.Reset;
    }
    printLevel(level) {
        const info = levelInfo[level];
        return `${info.color}${info.name}${ControlChars.Reset}`;
    }
    setLevel(level) {
        this.level = level;
    }
    log(level, message, ...args) {
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
    silly(message, ...args) {
        this.log(LogLevel.SILLY, message, args);
    }
    verbose(message, ...args) {
        this.log(LogLevel.VERBOSE, message, args);
    }
    info(message, ...args) {
        this.log(LogLevel.INFO, message, args);
    }
    http(message, ...args) {
        this.log(LogLevel.HTTP, message, args);
    }
    warn(message, ...args) {
        this.log(LogLevel.WARN, message, args);
    }
    error(message, ...args) {
        this.log(LogLevel.ERROR, message, args);
    }
    fatal(message, ...args) {
        this.log(LogLevel.FATAL, message, args);
    }
}
;
export const DefaultLogger = new Logger("DefaultLogger", true);
DefaultLogger.setLevel(LogLevel.INFO);
//# sourceMappingURL=Log.js.map