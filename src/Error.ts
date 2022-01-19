import * as logger from 'npmlog';

export function fatal(err:Error, name:string='Application') {
    logger.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        console.error(err.stack)
    }
    process.abort();
}
