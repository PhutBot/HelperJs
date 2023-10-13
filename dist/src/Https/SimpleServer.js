import * as http from 'http';
import * as fs from 'fs';
import * as events from 'events';
import { EnvBackedValue } from "../Env.js";
import { RequestMethod, Body } from "./Request.js";
import { ErrorHttp } from "./Errors/Error.js";
import { ErrorHttp404NotFound } from "./Errors/4XX.js";
import { ErrorHttp500Internal } from "./Errors/5XX.js";
import { PathMatcher } from "./PathMatcher.js";
import { Logger } from "../Log.js";
import { getMetadata } from "../Meta/Metadata.js";
import { MiddlewareStage } from "./Middleware.js";
import { WebSocketConnection } from "./WebSocket.js";
export class SimpleServer {
    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }
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
        this.logger = new Logger();
        if (settings.loglevel)
            this.logger.setLevel(settings.loglevel);
        this.hostname = (_a = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname)) !== null && _a !== void 0 ? _a : '0.0.0.0';
        this.port = (_b = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port)) !== null && _b !== void 0 ? _b : 8080;
        this.useCache = (_c = ((settings.useCache instanceof EnvBackedValue) ? settings.useCache.asBool() : settings.useCache)) !== null && _c !== void 0 ? _c : true;
        if (!!settings.preprocessor)
            this.preprocessor = settings.preprocessor;
        this.server = http.createServer(this._rootHandler.bind(this));
        this.server.on('connection', (socket) => {
            this.sockets.push(socket);
            this.eventEmitter.emit('simple-server-connection', { detail: socket });
        });
        this.server.on('upgrade', (req, socket) => {
            if (req.headers['upgrade'] !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                return;
            }
            const version = req.headers['sec-websocket-version'];
            if (version !== '13') {
                socket.end('HTTP/1.1 400 Bad Request\r\nsec-websocket-version: 13\r\n\r\n');
                return;
            }
            const protocol = req.headers['sec-websocket-protocol'];
            const request = this._translateRequest(req);
            try {
                const ws = new WebSocketConnection(this.websockets.length, request, socket, protocol);
                ws.on('text', (data) => {
                    this.eventEmitter.emit('simple-websocket-msg', { detail: { ws, data } });
                });
                this.websockets.push(ws);
                this.eventEmitter.emit('simple-websocket-connection', { detail: ws });
            }
            catch (err) {
                socket.end('HTTP/1.1 400 Bad Request\r\nsec-websocket-version: 13\r\n\r\n');
            }
        });
    }
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
        const _alias = PathMatcher.prepPath((_a = options.alias) !== null && _a !== void 0 ? _a : dirName.replace(/^\./, ''));
        this.dir2Alias[dirName] = _alias;
        this.alias2Dir[_alias] = dirName;
        this.defineHandler(RequestMethod.GET, `${_alias}/*`, (request) => new Promise((resolve, reject) => {
            var _a, _b;
            const path = request.url.pathname.replace(_alias, this.alias2Dir[_alias]);
            const headers = ((_b = (_a = options.model) === null || _a === void 0 ? void 0 : _a.headers) !== null && _b !== void 0 ? _b : {});
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
                    reject(new ErrorHttp500Internal(request, 'how is this not a file or a directory??'));
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
                reject(new ErrorHttp404NotFound(request));
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
                headers, body, model
            });
        }), options);
    }
    unmapDirectory(alias) {
        this.removeHandler(RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }
    mapHandler(target) {
        const clazzMeta = getMetadata(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.defineHandler(clazzMeta.method, clazzMeta.location, target);
            }
            else {
                Object.entries(Object.getOwnPropertyDescriptors(target)).forEach(([name, desc]) => {
                    const funcMeta = getMetadata(desc.value, '@RequestMapping');
                    if (typeof desc.value === 'function' && !!funcMeta) {
                        const path = [clazzMeta.location, funcMeta.location].join('/');
                        this.defineHandler(funcMeta.method, path, desc.value);
                    }
                });
            }
        }
    }
    unmapHandler(target) {
        const clazzMeta = getMetadata(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.removeHandler(clazzMeta.method, clazzMeta.location);
            }
            else {
                Object.entries(Object.getOwnPropertyDescriptors(target)).forEach(([name, desc]) => {
                    const funcMeta = getMetadata(desc.value, '@RequestMapping');
                    if (typeof desc.value === 'function' && !!funcMeta) {
                        const path = [clazzMeta.location, funcMeta.location].join('/');
                        this.removeHandler(funcMeta.method, path);
                    }
                });
            }
        }
    }
    defineHandler(method, path, handler, options = {}) {
        const matcher = new PathMatcher(path);
        if (matcher.path in this.handlers[method]) {
            if (!!options.force) {
                this.logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            }
            else {
                this.logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        this.logger.http('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method][matcher.path] = { matcher, handler };
    }
    removeHandler(method, path) {
        delete this.handlers[method][PathMatcher.prepPath(path)];
    }
    removeAllHandlers() {
        Object.entries(this.handlers).forEach(([method, handlers]) => {
            Object.entries(handlers).forEach(([path, handler]) => {
                delete this.handlers[method][PathMatcher.prepPath(path)];
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
                this.logger.http('SimpleServer', `server started @ ${this.address}`);
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
                    this.logger.http('SimpleServer', 'server stopped');
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
        const method = (_a = req.method) !== null && _a !== void 0 ? _a : RequestMethod.GET;
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
                    resolve(new Body(Buffer.concat(chunks)));
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
                throw new ErrorHttp404NotFound(request);
            }
            const model = { request };
            this.middlewares[MiddlewareStage.PRE_PROCESSOR].forEach(middleware => {
                middleware.process(model);
            });
            handler(request, model).then((response) => {
                response.headers = response.headers || {};
                this.middlewares[MiddlewareStage.POST_PROCESSOR].forEach(middleware => {
                    var _a;
                    middleware.process((_a = response.model) !== null && _a !== void 0 ? _a : model, response);
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
                if (!(error instanceof ErrorHttp)) {
                    error = new ErrorHttp500Internal(request, error instanceof Error
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
            if (!(error instanceof ErrorHttp)) {
                const dummyRequest = {
                    headers: {},
                    method: (_a = req.method) !== null && _a !== void 0 ? _a : RequestMethod.GET,
                    path: '',
                    pathParams: {},
                    queryParams: {},
                    socket: req.socket,
                    url: new URL((_b = req.url) !== null && _b !== void 0 ? _b : '', this.address),
                };
                if (error instanceof Error) {
                    error = new ErrorHttp500Internal(dummyRequest, error.message);
                }
                else {
                    error = new ErrorHttp500Internal(dummyRequest, `${error}`);
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
//# sourceMappingURL=SimpleServer.js.map