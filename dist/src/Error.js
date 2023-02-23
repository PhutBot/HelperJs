"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fatal = void 0;
const Log_1 = require("./Log");
function fatal(err, name = 'Application') {
    Log_1.DefaultLogger.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        Log_1.DefaultLogger.error(name, err.stack);
    }
    process.abort();
}
exports.fatal = fatal;
//# sourceMappingURL=Error.js.map