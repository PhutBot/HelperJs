import { DefaultLogger } from "./Log";

export function fatal(err:Error, name:string='Application') {
    DefaultLogger.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        DefaultLogger.error(name, err.stack!);
    }
    process.abort();
}
