import { DefaultLogger } from "./Log.js";
export function fatal(err) {
    DefaultLogger.error(`[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        DefaultLogger.error(err.stack);
    }
    process.abort();
}
//# sourceMappingURL=Error.js.map