"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleServer = void 0;
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const Env_1 = require("../Env");
const Request_1 = require("./Request");
const Error_1 = require("./Error");
const PathMatcher_1 = require("./PathMatcher");
const Log_1 = require("../Log");
const Metadata_1 = require("../Meta/Metadata");
class SimpleServer {
    constructor(settings = {}) {
        var _a, _b, _c, _d;
        this.alias2Dir = {};
        this.dir2Alias = {};
        this.cachedFiles = {};
        this.sockets = [];
        this.handlers = { DELETE: {}, GET: {}, PATCH: {}, POST: {}, PUT: {} };
        this.errorHandlers = {};
        this._running = false;
        this.logger = new Log_1.Logger((_a = settings.loglevel) !== null && _a !== void 0 ? _a : 'info');
        this.hostname = (_b = ((settings.hostname instanceof Env_1.EnvBackedValue) ? settings.hostname.get() : settings.hostname)) !== null && _b !== void 0 ? _b : '0.0.0.0';
        this.port = (_c = ((settings.port instanceof Env_1.EnvBackedValue) ? settings.port.asInt() : settings.port)) !== null && _c !== void 0 ? _c : 8080;
        this.useCache = (_d = ((settings.useCache instanceof Env_1.EnvBackedValue) ? settings.useCache.asBool() : settings.useCache)) !== null && _d !== void 0 ? _d : true;
        this.server = http.createServer(this._rootHandler.bind(this));
        this.server.on('connection', (socket) => {
            this.sockets.push(socket);
        });
    }
    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }
    mapDirectory(dirName, options = {}) {
        var _a;
        dirName = dirName.endsWith('/') ? dirName : `${dirName}/`;
        options.cache = options.cache === undefined ? true : options.cache;
        const _alias = PathMatcher_1.PathMatcher.prepPath((_a = options.alias) !== null && _a !== void 0 ? _a : dirName.replace(/^\./, ''));
        this.dir2Alias[dirName] = _alias;
        this.alias2Dir[_alias] = dirName;
        this.defineHandler(Request_1.RequestMethod.GET, `${_alias}/*`, (request) => new Promise((resolve, reject) => {
            const path = request.url.pathname.replace(_alias, this.alias2Dir[_alias]);
            const headers = {};
            let encoding = 'utf8';
            let contentType = '';
            let file = ''; // TODO: files should only be cached once even if the path is "different"
            if (this.useCache && !!options.cache && path in this.cachedFiles) {
                file = this.cachedFiles[path];
            }
            else if (fs.existsSync(path)) {
                const stat = fs.lstatSync(path);
                if (stat.isFile()) {
                    if (path.endsWith('.html')) {
                        contentType = 'text/html';
                    }
                    else if (path.endsWith('.png')) {
                        contentType = 'image/png';
                        encoding = 'binary';
                    }
                    else if (path.endsWith('.js')) {
                        contentType = 'application/javascript';
                    }
                    else if (path.endsWith('.css')) {
                        contentType = 'text/css';
                    }
                    else {
                        contentType = 'text/plain';
                    }
                    file = Buffer.from(fs.readFileSync(`./${path}`, encoding), encoding);
                }
                else if (stat.isDirectory()) {
                    if (fs.existsSync(`./${path}/index.html`)) {
                        contentType = 'text/html';
                        file = fs.readFileSync(`./${path}/index.html`, encoding);
                    }
                    else if (fs.existsSync(`./${path}/index.js`)) {
                        contentType = 'application/javascript';
                        file = fs.readFileSync(`./${path}/index.js`, encoding);
                    }
                }
                else {
                    reject(new Error_1.InternalServerError('how is this not a file or a directory??'));
                }
                if (this.useCache && !!options.cache && !!file) {
                    this.cachedFiles[path] = file;
                }
            }
            else if (fs.existsSync(path + '.html')) {
                contentType = 'text/html';
                file = fs.readFileSync(`./${path}.html`, encoding);
                if (this.useCache && !!options.cache) {
                    this.cachedFiles[path] = file;
                }
            }
            headers['content-type'] = [contentType];
            if (!file) {
                reject(new Error_1.PageNotFoundError(request.url));
            }
            else {
                resolve({
                    statusCode: 200,
                    headers,
                    body: file
                });
            }
        }), options);
    }
    unmapDirectory(alias) {
        this.removeHandler(Request_1.RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }
    mapHandler(target) {
        const clazzMeta = (0, Metadata_1.getMetadata)(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.defineHandler(clazzMeta.method, clazzMeta.location, target);
            }
            else {
                Object.entries(Object.getOwnPropertyDescriptors(target)).forEach(([name, desc]) => {
                    const funcMeta = (0, Metadata_1.getMetadata)(desc.value, '@RequestMapping');
                    if (typeof desc.value === 'function' && !!funcMeta) {
                        const path = [clazzMeta.location, funcMeta.location].join('/');
                        this.defineHandler(funcMeta.method, path, desc.value);
                    }
                });
            }
        }
    }
    unmapHandler(target) {
        const clazzMeta = (0, Metadata_1.getMetadata)(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.removeHandler(clazzMeta.method, clazzMeta.location);
            }
            else {
                Object.entries(Object.getOwnPropertyDescriptors(target)).forEach(([name, desc]) => {
                    const funcMeta = (0, Metadata_1.getMetadata)(desc.value, '@RequestMapping');
                    if (typeof desc.value === 'function' && !!funcMeta) {
                        const path = [clazzMeta.location, funcMeta.location].join('/');
                        this.removeHandler(funcMeta.method, path);
                    }
                });
            }
        }
    }
    defineHandler(method, path, handler, options = {}) {
        const matcher = new PathMatcher_1.PathMatcher(path);
        if (matcher.path in this.handlers[method]) {
            if (!!options.force) {
                this.logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            }
            else {
                this.logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        this.logger.info('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method][matcher.path] = { matcher, handler };
    }
    removeHandler(method, path) {
        delete this.handlers[method][PathMatcher_1.PathMatcher.prepPath(path)];
    }
    start() {
        return new Promise((res, rej) => {
            if (this._running) {
                this.logger.warn('SimpleServer', 'server already started');
                rej(new Error('server already started'));
                return;
            }
            this.server.listen(this.port, this.hostname, () => {
                this._running = true;
                this.logger.info('SimpleServer', `server started @ ${this.address}`);
                res(true);
            });
        });
    }
    stop() {
        return new Promise((res, rej) => {
            if (!this._running) {
                this.logger.warn('SimpleServer', 'server already stopped');
                rej(new Error('server already stopped'));
            }
            else {
                this.sockets.forEach(socket => socket.destroy());
                this.server.close(() => {
                    this.logger.info('SimpleServer', 'server stopped');
                    this._running = false;
                    res(true);
                });
            }
        });
    }
    _getHandler(m, url) {
        const method = m;
        const path = url.pathname;
        const record = Object.values(this.handlers[method])
            .reduce((pre, cur) => {
            if (cur.matcher.match(path).isMatch) {
                if (!pre) {
                    return cur;
                }
                else if (cur.matcher.isWild !== pre.matcher.isWild) {
                    return cur.matcher.isWild ? pre : cur;
                }
                else if (cur.matcher.isDynamic !== pre.matcher.isDynamic) { // TODO: this may need to be a counter
                    return cur.matcher.isDynamic ? pre : cur;
                }
                else {
                    return cur.matcher.path.length < pre.matcher.path.length ? pre : cur;
                }
            }
            return pre;
        }, null);
        if (!!record) {
            this.logger.http('SimpleServer', `${method} - ${path}`);
            const match = record.matcher.match(path);
            return {
                handler: record.handler,
                pathParams: match.vars
            };
        }
        else {
            throw new Error_1.PageNotFoundError(url);
        }
    }
    _rootHandler(req, res) {
        var _a, _b, _c;
        try {
            const method = (_a = req.method) !== null && _a !== void 0 ? _a : Request_1.RequestMethod.GET;
            const url = new URL((_b = req.url) !== null && _b !== void 0 ? _b : '', this.address);
            const path = url.pathname;
            const headers = {};
            Object.entries(req.headers).forEach(([key, val]) => {
                headers[key] = headers[key] || [];
                if (!!val)
                    headers[key].push(...val);
            });
            const queryParams = {};
            for (const [key, val] of url.searchParams.entries()) {
                queryParams[key] = queryParams[key] || [];
                queryParams[key].push(val);
            }
            const { handler, pathParams } = this._getHandler(method, url);
            handler({
                method,
                url,
                path,
                pathParams,
                queryParams,
                headers,
                body: () => new Promise((resolve, reject) => {
                    let body = '';
                    req.on('data', (chunk) => {
                        body += chunk;
                    });
                    req.on('end', () => {
                        resolve(new Request_1.Body(body));
                    });
                    req.on('error', (err) => {
                        reject(err);
                    });
                })
            }).then((response) => {
                response.headers = response.headers || {};
                if (!response.headers.hasOwnProperty('content-type'))
                    response.headers['content-type'] = ['text/plain'];
                for (const [key, value] of Object.entries(response.headers)) {
                    res.setHeader(key, value);
                }
                res.writeHead(response.statusCode);
                res.end(response.body);
            }).catch((error) => {
                var _a;
                if (!(error instanceof Error_1.HttpError)) {
                    error = new Error_1.InternalServerError(error instanceof Error
                        ? error.message : `${error}`);
                }
                const httpError = error;
                res.writeHead(httpError.statusCode);
                res.end(httpError.description);
                this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
                this.logger.error('SimpleServer', (_a = httpError.stack) !== null && _a !== void 0 ? _a : httpError.message);
            });
        }
        catch (error) {
            if (!(error instanceof Error_1.HttpError)) {
                if (error instanceof Error) {
                    error = new Error_1.InternalServerError(error.message);
                }
                else {
                    error = new Error_1.InternalServerError(`${error}`);
                }
            }
            const httpError = error;
            res.writeHead(httpError.statusCode);
            res.end(httpError.description);
            this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
            this.logger.error('SimpleServer', (_c = httpError.stack) !== null && _c !== void 0 ? _c : httpError.message);
        }
    }
}
exports.SimpleServer = SimpleServer;
//# sourceMappingURL=SimpleServer.js.map