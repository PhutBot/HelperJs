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
const events = __importStar(require("events"));
const Env_1 = require("../Env");
const Request_1 = require("./Request");
const Error_1 = require("./Errors/Error");
const _4XX_1 = require("./Errors/4XX");
const _5XX_1 = require("./Errors/5XX");
const PathMatcher_1 = require("./PathMatcher");
const Log_1 = require("../Log");
const Metadata_1 = require("../Meta/Metadata");
const Middleware_1 = require("./Middleware");
const WebSocket_1 = require("./WebSocket");
class SimpleServer {
    constructor(settings = {}) {
        var _a, _b, _c;
        this.alias2Dir = {};
        this.dir2Alias = {};
        this.cachedFiles = {};
        this.eventEmitter = new events.EventEmitter();
        this.sockets = [];
        this.websockets = [];
        this.handlers = { DELETE: {}, GET: {}, PATCH: {}, POST: {}, PUT: {} };
        // private errorHandlers:Record<number,RequestHandler> = {};
        this._running = false;
        this.middlewares = { PRE_PROCESSOR: [], POST_PROCESSOR: [] };
        this.preprocessor = (_, view) => view;
        this.logger = new Log_1.Logger();
        this.hostname = (_a = ((settings.hostname instanceof Env_1.EnvBackedValue) ? settings.hostname.get() : settings.hostname)) !== null && _a !== void 0 ? _a : '0.0.0.0';
        this.port = (_b = ((settings.port instanceof Env_1.EnvBackedValue) ? settings.port.asInt() : settings.port)) !== null && _b !== void 0 ? _b : 8080;
        this.useCache = (_c = ((settings.useCache instanceof Env_1.EnvBackedValue) ? settings.useCache.asBool() : settings.useCache)) !== null && _c !== void 0 ? _c : true;
        if (!!settings.preprocessor)
            this.preprocessor = settings.preprocessor;
        this.server = http.createServer(this._rootHandler.bind(this));
        this.server.on('connection', (socket) => {
            this.sockets.push(socket);
            this.eventEmitter.emit('simple-server-connection', { detail: socket });
        });
        this.server.on('upgrade', (req, socket) => {
            const request = this._translateRequest(req);
            const ws = new WebSocket_1.WebSocketConnection(this.websockets.length, request, socket);
            ws.on('text', (data) => {
                this.eventEmitter.emit('simple-websocket-msg', { detail: { ws, data } });
            });
            this.websockets.push(ws);
            this.eventEmitter.emit('simple-websocket-connection', { detail: ws });
        });
    }
    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }
    addMiddleware(middleware) {
        this.middlewares[middleware.stage].push(middleware);
    }
    addEventListener(eventName, handler) {
        this.eventEmitter.addListener(eventName, (...args) => {
            handler(args[0]);
        });
    }
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
            request.filePath = path;
            let encoding = 'utf8';
            let file = {
                type: 'text/plain',
                content: ''
            };
            // TODO: files should only be cached once even if the path is "different"
            if (this.useCache && !!options.cache && path in this.cachedFiles) {
                file = this.cachedFiles[path];
            }
            else if (fs.existsSync(path)) {
                const stat = fs.lstatSync(path);
                if (stat.isFile()) {
                    if (path.endsWith('.html')) {
                        file.type = 'text/html';
                    }
                    else if (path.endsWith('.png')) {
                        file.type = 'image/png';
                        encoding = 'binary';
                    }
                    else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                        file.type = 'image/jpeg';
                        encoding = 'binary';
                    }
                    else if (path.endsWith('.js')) {
                        file.type = 'application/javascript';
                    }
                    else if (path.endsWith('.css')) {
                        file.type = 'text/css';
                    }
                    file.content = Buffer.from(fs.readFileSync(`./${path}`, encoding), encoding);
                }
                else if (stat.isDirectory()) {
                    if (fs.existsSync(`./${path}/index.html`)) {
                        file.type = 'text/html';
                        file.content = fs.readFileSync(`./${path}/index.html`, encoding);
                    }
                    else if (fs.existsSync(`./${path}/index.js`)) {
                        file.type = 'application/javascript';
                        file.content = fs.readFileSync(`./${path}/index.js`, encoding);
                    }
                }
                else {
                    reject(new _5XX_1.ErrorHttp500Internal(request, 'how is this not a file or a directory??'));
                    return;
                }
                if (this.useCache && !!options.cache && !!file) {
                    this.cachedFiles[path] = file;
                }
            }
            else if (fs.existsSync(path + '.html')) {
                file.type = 'text/html';
                file.content = fs.readFileSync(`./${path}.html`, encoding);
                if (this.useCache && !!options.cache) {
                    this.cachedFiles[path] = file;
                }
            }
            else {
                reject(new _4XX_1.ErrorHttp404NotFound(request));
                return;
            }
            headers['content-type'] = [file.type];
            const model = typeof options.model === 'function'
                ? options.model({ request })
                : options.model;
            const body = file.type === 'text/html' && !Buffer.isBuffer(file.content)
                ? this.preprocessor(model, file.content)
                : file.content;
            resolve({
                statusCode: 200,
                headers, body
            });
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
    removeAllHandlers() {
        Object.entries(this.handlers).forEach(([method, handlers]) => {
            Object.entries(handlers).forEach(([path, handler]) => {
                delete this.handlers[method][PathMatcher_1.PathMatcher.prepPath(path)];
            });
        });
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
                this.websockets.forEach(ws => ws.close());
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
            return {
                handler: null,
                pathParams: {}
            };
        }
    }
    _translateRequest(req) {
        var _a, _b;
        const method = (_a = req.method) !== null && _a !== void 0 ? _a : Request_1.RequestMethod.GET;
        const url = new URL((_b = req.url) !== null && _b !== void 0 ? _b : '', this.address);
        const path = url.pathname;
        const headers = {};
        Object.entries(req.headers).forEach(([key, val]) => {
            headers[key] = headers[key] || [];
            if (!!val) {
                if (Array.isArray(val))
                    headers[key].push(...val);
                else
                    headers[key].push(val);
            }
        });
        const queryParams = {};
        for (const [key, val] of url.searchParams.entries()) {
            queryParams[key] = queryParams[key] || [];
            queryParams[key].push(val);
        }
        const request = {
            socket: req.socket,
            method,
            url,
            path,
            pathParams: {},
            queryParams,
            headers,
            body: () => new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                req.on('end', () => {
                    resolve(new Request_1.Body(Buffer.concat(chunks)));
                });
                req.on('error', (err) => {
                    reject(err);
                });
            }),
        };
        return request;
    }
    _rootHandler(req, res) {
        var _a, _b, _c;
        try {
            // const method = req.method as RequestMethod ?? RequestMethod.GET;
            // const url = new URL(req.url ?? '', this.address);
            // const path = url.pathname;
            // const headers:Headers = {};
            // Object.entries(req.headers).forEach(([key, val]) => {
            //     headers[key] = headers[key] || [];
            //     if (!!val) {
            //         if (Array.isArray(val))
            //             headers[key].push(...val);
            //         else
            //             headers[key].push(val);
            //     }
            // });
            // const queryParams:QueryParams = {};
            // for (const [key, val] of url.searchParams.entries()) {
            //     queryParams[key] = queryParams[key] || [];
            //     queryParams[key].push(val);
            // }
            const request = this._translateRequest(req);
            const { handler, pathParams } = this._getHandler(request.method, request.url);
            request.pathParams = pathParams;
            // const request:HttpRequest = {
            //     socket: req.socket,
            //     method,
            //     url,
            //     path,
            //     pathParams,
            //     queryParams,
            //     headers,
            //     body: () => new Promise((resolve, reject) => {
            //         const chunks:Buffer[] = [];
            //         req.on('data', (chunk) => {
            //             chunks.push(chunk);
            //         });
            //         req.on('end', () => {
            //             resolve(new Body(Buffer.concat(chunks)));
            //         });
            //         req.on('error', (err) => {
            //             reject(err);
            //         });
            //     }),
            // };
            if (handler === null) {
                throw new _4XX_1.ErrorHttp404NotFound(request);
            }
            const model = { request };
            this.middlewares[Middleware_1.MiddlewareStage.PRE_PROCESSOR].forEach(middleware => {
                middleware.process(model);
            });
            handler(request, model).then((response) => {
                response.headers = response.headers || {};
                this.middlewares[Middleware_1.MiddlewareStage.POST_PROCESSOR].forEach(middleware => {
                    middleware.process(model, response);
                });
                if (!response.headers.hasOwnProperty('content-type'))
                    response.headers['content-type'] = ['text/plain'];
                for (const [key, value] of Object.entries(response.headers)) {
                    res.setHeader(key, value);
                }
                res.writeHead(response.statusCode);
                res.end(response.body);
            }).catch((error) => {
                var _a;
                if (!(error instanceof Error_1.ErrorHttp)) {
                    error = new _5XX_1.ErrorHttp500Internal(request, error instanceof Error
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
            if (!(error instanceof Error_1.ErrorHttp)) {
                const dummyRequest = {
                    headers: {},
                    method: (_a = req.method) !== null && _a !== void 0 ? _a : Request_1.RequestMethod.GET,
                    path: '',
                    pathParams: {},
                    queryParams: {},
                    socket: req.socket,
                    url: new URL((_b = req.url) !== null && _b !== void 0 ? _b : '', this.address),
                };
                if (error instanceof Error) {
                    error = new _5XX_1.ErrorHttp500Internal(dummyRequest, error.message);
                }
                else {
                    error = new _5XX_1.ErrorHttp500Internal(dummyRequest, `${error}`);
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