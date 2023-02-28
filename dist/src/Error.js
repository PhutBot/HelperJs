import { DefaultLogger } from "./Log.js";
export function fatal(err, name = 'Application') {
    DefaultLogger.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        DefaultLogger.error(name, err.stack);
    }
    process.abort();
}
//# sourceMappingURL=Error.js.map