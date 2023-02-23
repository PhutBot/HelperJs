"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = exports.Logger = exports.LogLevel = void 0;
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
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["SILLY"] = 0] = "SILLY";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["HTTP"] = 3] = "HTTP";
    LogLevel[LogLevel["WARN"] = 4] = "WARN";
    LogLevel[LogLevel["ERROR"] = 5] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 6] = "FATAL";
    LogLevel[LogLevel["SILENT"] = 7] = "SILENT";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
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
class Logger {
    constructor(heading) {
        this.level = LogLevel.INFO;
        if (heading instanceof Function || typeof heading === 'string')
            this.heading = heading;
        else if (!!heading)
            this.heading = () => new Date().toISOString();
    }
    printPrefix(text) {
        return !text ? "" : `${ControlChars.FgMagenta}${text} `;
    }
    printLevel(level) {
        const info = levelInfo[level];
        return `${info.color}${info.name}${ControlChars.Reset}`;
    }
    printHeading() {
        const heading = !this.heading ? ""
            : (this.heading instanceof Function ? this.heading() : this.heading) + " ";
        return ControlChars.FgBlue + heading + ControlChars.Reset;
    }
    setLevel(level) {
        this.level = level;
    }
    log(level, prefix, message, ...args) {
        if (level < this.level)
            return;
        console.log(`${this.printHeading()}${this.printLevel(level)} ${this.printPrefix(prefix)}${ControlChars.FgWhite}${message}${ControlChars.Reset}`, ...args);
    }
    silly(prefix, message, ...args) {
        this.log(LogLevel.SILLY, prefix, message, args);
    }
    verbose(prefix, message, ...args) {
        this.log(LogLevel.VERBOSE, prefix, message);
    }
    info(prefix, message, ...args) {
        this.log(LogLevel.INFO, prefix, message);
    }
    http(prefix, message, ...args) {
        this.log(LogLevel.HTTP, prefix, message);
    }
    warn(prefix, message, ...args) {
        this.log(LogLevel.WARN, prefix, message);
    }
    error(prefix, message, ...args) {
        this.log(LogLevel.ERROR, prefix, message);
    }
    fatal(prefix, message, ...args) {
        this.log(LogLevel.FATAL, prefix, message);
    }
}
exports.Logger = Logger;
;
exports.DefaultLogger = new Logger(true);
exports.DefaultLogger.setLevel(LogLevel.INFO);
//# sourceMappingURL=Log.js.map