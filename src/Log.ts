import npmlog from "npmlog";

export class Logger {
    readonly loglevel:string;

    constructor(loglevel:string) {
        this.loglevel = loglevel;
    }

    silly(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.silly.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }

    verbose(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.verbose.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }

    info(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.info.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }

    http(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.http.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }

    warn(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.warn.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }

    error(prefix:string, message:string, ...args:any[]) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.error.call(npmlog, prefix, message, args);
        npmlog.level = level;
    }
}