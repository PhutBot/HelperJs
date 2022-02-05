import npmlog from 'npmlog';

export function fatal(err:Error, name:string='Application') {
    npmlog.error(name, `[FATAL]: ${err}`);
    if (typeof err === 'object' && 'stack' in err) {
        npmlog.error(name, err.stack!);
    }
    process.abort();
}
