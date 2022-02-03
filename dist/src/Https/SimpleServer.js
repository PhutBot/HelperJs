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
const logger = __importStar(require("npmlog"));
const fs = __importStar(require("fs"));
const Env_1 = require("../Env");
const Request_1 = require("./Request");
const Error_1 = require("./Error");
const PathMatcher_1 = require("./PathMatcher");
class SimpleServer {
    constructor(settings = {}) {
        var _a, _b, _c;
        this.alias2Dir = {};
        this.dir2Alias = {};
        this.cachedFiles = {};
        this.sockets = [];
        this.handlers = { DELETE: {}, GET: {}, PATCH: {}, POST: {}, PUT: {} };
        this.errorHandlers = {};
        this._running = false;
        this.hostname = (_a = ((settings.hostname instanceof Env_1.EnvBackedValue) ? settings.hostname.get() : settings.hostname)) !== null && _a !== void 0 ? _a : '0.0.0.0';
        this.port = (_b = ((settings.port instanceof Env_1.EnvBackedValue) ? settings.port.asInt() : settings.port)) !== null && _b !== void 0 ? _b : 8080;
        this.useCache = (_c = ((settings.useCache instanceof Env_1.EnvBackedValue) ? settings.useCache.asBool() : settings.useCache)) !== null && _c !== void 0 ? _c : true;
        this.server = http.createServer((req, res) => {
            var _a, _b;
            const url = new URL((_a = req.url) !== null && _a !== void 0 ? _a : 'localhost', `http://${req.headers.host}`);
            try {
                const { handler, options } = this._getHandler((_b = req.method) !== null && _b !== void 0 ? _b : 'GET', url);
                handler(req, res, options);
            }
            catch (err) {
                try {
                    this._handleError(url, req, res, (err instanceof Error_1.HttpError) ? err : new Error_1.InternalServerError(`${err}`));
                }
                catch (fatal) {
                    logger.error('SimpleServer', `[FATAL ERROR]: ${fatal}`);
                    throw fatal;
                }
            }
        });
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
        this.defineHandler(Request_1.RequestMethod.GET, `${_alias}/*`, (_, res, requestOptions) => {
            const path = requestOptions.url.pathname.replace(_alias, this.alias2Dir[_alias]);
            let file = null; // TODO: files should only be cached once even if the path is "different"
            if (this.useCache && !!options.cache && path in this.cachedFiles) {
                file = this.cachedFiles[path];
            }
            else if (fs.existsSync(path)) {
                const stat = fs.lstatSync(path);
                if (stat.isFile()) {
                    if (path.endsWith('.html')) {
                        res.setHeader('content-type', 'text/html');
                    }
                    else if (path.endsWith('.js')) {
                        res.setHeader('content-type', 'application/javascript');
                    }
                    else if (path.endsWith('.css')) {
                        res.setHeader('content-type', 'text/css');
                    }
                    else {
                        res.setHeader('content-type', 'text/plain');
                    }
                    file = fs.readFileSync(`./${path}`);
                }
                else if (stat.isDirectory()) {
                    if (fs.existsSync(`./${path}/index.html`)) {
                        res.setHeader('content-type', 'text/html');
                        file = fs.readFileSync(`./${path}/index.html`, 'utf8');
                    }
                    else if (fs.existsSync(`./${path}/index.js`)) {
                        res.setHeader('content-type', 'application/javascript');
                        file = fs.readFileSync(`./${path}/index.js`, 'utf8');
                    }
                }
                else {
                    throw new Error('how is this not a file or a directory??');
                }
                if (this.useCache && !!options.cache && !!file) {
                    this.cachedFiles[path] = file;
                }
            }
            else if (fs.existsSync(path + '.html')) {
                res.setHeader('content-type', 'text/html');
                file = fs.readFileSync(`./${path}.html`, 'utf8');
                if (this.useCache && !!options.cache) {
                    this.cachedFiles[path] = file;
                }
            }
            if (!file) {
                throw new Error_1.PageNotFoundError(requestOptions.url);
            }
            else {
                res.writeHead(200);
                res.end(file);
            }
        }, options);
    }
    unmapDirectory(alias) {
        this.removeHandler(Request_1.RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }
    defineHandler(method, path, handler, options = {}) {
        const matcher = new PathMatcher_1.PathMatcher(path);
        if (matcher.path in this.handlers[method]) {
            if (!!options.force) {
                logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            }
            else {
                logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        logger.verbose('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method][path] = { matcher, handler };
    }
    removeHandler(method, path) {
        delete this.handlers[method][PathMatcher_1.PathMatcher.prepPath(path)];
    }
    start() {
        return new Promise((res, rej) => {
            if (this._running) {
                logger.warn('SimpleServer', 'server already started');
                rej('server already started');
                return;
            }
            this.server.listen(this.port, this.hostname, () => {
                this._running = true;
                logger.info('SimpleServer', `server started @ ${this.address}`);
                res(true);
            });
        });
    }
    stop() {
        return new Promise((res, rej) => {
            if (!this._running) {
                logger.warn('SimpleServer', 'server already stopped');
                rej('server already stopped');
            }
            else {
                this.sockets.forEach(socket => socket.destroy());
                this.server.close(() => {
                    logger.info('SimpleServer', 'server stopped');
                    this._running = false;
                    res(true);
                });
            }
        });
    }
    _getHandler(method, url) {
        const path = url.pathname;
        logger.http('SimpleServer', `${method} - ${path}`);
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
            const match = record.matcher.match(path);
            return {
                handler: record.handler,
                options: { url, vars: match.vars }
            };
        }
        else {
            throw new Error_1.PageNotFoundError(url);
        }
    }
    _handleError(url, req, res, err) {
        if (err.statusCode in this.errorHandlers) {
            this.errorHandlers[err.statusCode](req, res, { url, err });
        }
        else {
            logger.error('SimpleServer', `[${err.statusCode}] ${err.message}`);
            res.writeHead(err.statusCode);
            res.end(`Error ${err.statusCode}: ${err.description}`);
        }
    }
}
exports.SimpleServer = SimpleServer;
function pathToPattern(path) {
    const map = {};
    const regex = /\{([_a-zA-Z][_a-zA-Z0-9])\}/g;
    const parts = path.split('/');
    parts.forEach((part, idx, arr) => {
        if (part.startsWith('{')) {
            if (part.endsWith('}')) {
                part = part.toLocaleLowerCase();
                map[idx] = part;
            }
            else {
                throw new Error('invalid wild handler pattern');
            }
        }
    });
    return {
        path: parts,
        map
    };
}
//# sourceMappingURL=SimpleServer.js.map