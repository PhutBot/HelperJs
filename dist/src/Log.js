"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const npmlog_1 = __importDefault(require("npmlog"));
class Logger {
    constructor(loglevel) {
        this.loglevel = loglevel;
    }
    silly(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.silly.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
    verbose(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.verbose.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
    info(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.info.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
    http(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.http.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
    warn(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.warn.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
    error(...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.error.apply(npmlog_1.default, args);
        npmlog_1.default.level = level;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Log.js.map