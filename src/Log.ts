import npmlog from "npmlog";

export class Logger {
    readonly loglevel:string;

    constructor(loglevel:string) {
        this.loglevel = loglevel;
    }

    silly(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.silly.apply(npmlog, args);
        npmlog.level = level;
    }

    verbose(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.verbose.apply(npmlog, args);
        npmlog.level = level;
    }

    info(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.info.apply(npmlog, args);
        npmlog.level = level;
    }

    http(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.http.apply(npmlog, args);
        npmlog.level = level;
    }

    warn(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.warn.apply(npmlog, args);
        npmlog.level = level;
    }

    error(...args:any) {
        const level = npmlog.level;
        npmlog.level = this.loglevel;
        npmlog.error.apply(npmlog, args);
        npmlog.level = level;
    }
}