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
const Env_1 = require("../Env");
const Error_1 = require("./Error");
const PathMatcher_1 = require("./PathMatcher");
class SimpleServer {
    constructor(settings = {}) {
        var _a, _b;
        this.sockets = [];
        this.handlers = { DELETE: {}, GET: {}, PATCH: {}, POST: {}, PUT: {} };
        // private staticHandlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
        // private wildHandlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
        this.errorHandlers = {};
        this._running = false;
        this.hostname = (_a = ((settings.hostname instanceof Env_1.EnvBackedValue) ? settings.hostname.get() : settings.hostname)) !== null && _a !== void 0 ? _a : '0.0.0.0';
        this.port = (_b = ((settings.port instanceof Env_1.EnvBackedValue) ? settings.port.asInt() : settings.port)) !== null && _b !== void 0 ? _b : 8080;
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
    defineHandler(method, path, handler, force = false) {
        const matcher = new PathMatcher_1.PathMatcher(path);
        if (matcher.path in this.handlers[method]) {
            if (force) {
                logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            }
            else {
                logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        this.handlers[method][path] = { matcher, handler };
    }
    removeHandler(method, path) {
        const matcher = new PathMatcher_1.PathMatcher(path);
        delete this.handlers[method][matcher.path];
    }
    start() {
        if (this._running) {
            logger.warn('SimpleServer', `server already started`);
            return;
        }
        this.server.listen(this.port, this.hostname, () => {
            this._running = true;
            logger.info('SimpleServer', `server started @ ${this.address}`);
        });
    }
    stop() {
        if (!this._running) {
            logger.warn('SimpleServer', `server already stopped`);
            return;
        }
        this.sockets.forEach(socket => socket.destroy());
        this.server.close(() => {
            logger.info('SimpleServer', 'server stopped');
            this._running = false;
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
                else if (cur.matcher.isDynamic !== pre.matcher.isDynamic) { // this may need to be a counter
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