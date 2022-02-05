"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fatal = void 0;
const npmlog_1 = __importDefault(require("npmlog"));
function fatal(err, name = 'Application') {
    npmlog_1.default.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        npmlog_1.default.error(name, err.stack);
    }
    process.abort();
}
exports.fatal = fatal;
//# sourceMappingURL=Error.js.map