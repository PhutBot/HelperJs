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
    silly(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.silly.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
    verbose(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.verbose.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
    info(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.info.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
    http(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.http.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
    warn(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.warn.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
    error(prefix, message, ...args) {
        const level = npmlog_1.default.level;
        npmlog_1.default.level = this.loglevel;
        npmlog_1.default.error.call(npmlog_1.default, prefix, message, args);
        npmlog_1.default.level = level;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Log.js.map