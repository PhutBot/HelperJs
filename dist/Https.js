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
exports.SimpleServer = exports.request = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
// PhutBot PLEASE remember to be careful when debugging this class on stream
function request(settings) {
    var _a, _b;
    settings = Object.assign({
        method: 'GET',
        protocol: 'HTTPS',
        port: 443
    }, settings);
    let path = settings.uri;
    if (!!settings.query) {
        const entries = Object.entries(settings.query);
        if (!path.includes('?') && entries.length > 0) {
            let [key, val] = (_a = entries.shift()) !== null && _a !== void 0 ? _a : ['', ''];
            while (!val && entries.length > 0) {
                [key, val] = (_b = entries.shift()) !== null && _b !== void 0 ? _b : ['', ''];
            }
            if (!!val) {
                path += `?${key}=${val}`;
            }
        }
        entries.forEach(([key, val]) => {
            if (!!val) {
                path += `&${key}=${val}`;
            }
        });
    }
    return new Promise((resolve, reject) => {
        const proto = settings.protocol === 'HTTP' ? http : https;
        const req = proto.request({
            path,
            hostname: settings.hostname,
            port: settings.port,
            method: settings.method,
            headers: settings.headers,
        }, res => {
            let data = [];
            res.on('error', (err) => {
                reject(err);
            }).on('data', chunk => {
                data.push(chunk);
            }).on('end', () => {
                data = Buffer.concat(data).toString();
                resolve({
                    headers: res.headers,
                    body: res.headers['content-type']
                        && res.headers['content-type'].toLowerCase()
                            .startsWith('application/json')
                        ? JSON.parse(data.toString())
                        : data.toString()
                });
            });
        });
        req.on('error', err => {
            reject(`request - ${err}`);
        });
        if (!!settings.body) {
            if (typeof settings.body === 'object' || Array.isArray(settings.body)) {
                req.write(JSON.stringify(settings.body));
            }
            else {
                req.write(settings.body);
            }
        }
        req.end();
    });
}
exports.request = request;
class SimpleServer {
    constructor(settings = {}) {
        this._running = false;
        this._errHandlers = {
            '404': (url, req, res) => {
                res.writeHead(404);
                res.end('Error 404: Page not found');
            },
            '500': (url, req, res) => {
                res.writeHead(500);
                res.end('Error 500: Internal server error');
            }
        };
        this._handlers = { GET: {}, POST: {} };
        this._sockets = [];
        this._settings = Object.assign({
            hostname: '0.0.0.0',
            port: 8080
        }, settings);
        this._server = http.createServer((req, res) => {
            var _a, _b;
            const methodName = ((_a = req.method) !== null && _a !== void 0 ? _a : 'GET');
            const url = new URL((_b = req.url) !== null && _b !== void 0 ? _b : 'localhost', `http://${req.headers.host}`);
            let handler = this._errHandlers['404'];
            try {
                if (methodName in this._handlers) {
                    const method = this._handlers[methodName];
                    if (url.pathname in method) {
                        handler = method[url.pathname];
                    }
                }
            }
            catch (err) {
                handler = this._errHandlers['500'];
                console.error(`[ERROR] SimpleServer.SimpleServer: 1 - ${err}`);
            }
            try {
                handler(url, req, res);
            }
            catch (err) {
                try {
                    console.error(`[ERROR] SimpleServe.SimpleServer: 2 - ${err}`);
                    this._errHandlers['500'](url, req, res);
                }
                catch (err2) {
                    console.error(`[FATAL] SimpleServe.SimpleServer: 3 - ${err2}`);
                    process.exit(1);
                }
            }
        });
        this._server.on('connection', (socket) => {
            this._sockets.push(socket);
        });
    }
    get running() { return this._running; }
    get port() { return this._settings.port; }
    get hostname() { return this._settings.hostname === '0.0.0.0' ? 'localhost' : this._settings.hostname; }
    get address() { return `http://${this.hostname}:${this.port}`; }
    defineHandler(method, path, handler) {
        if (!(method in this._handlers)) {
            throw 'SimpleServer.defineHandler - unsupported method';
        }
        else if (!(path in this._handlers[method])) {
            throw `SimpleServer.defineHandler - method already has endpoint ${path}`;
        }
        this._handlers[method][path] = handler;
    }
    start() {
        this._server.listen(this.port, this.hostname, () => {
            this._running = true;
            console.log(`[INFO] SimpleServer.start: Server started @ ${this.address}`);
        });
    }
    stop() {
        this._sockets.forEach(socket => {
            socket.destroy();
        });
        this._server.close(() => {
            this._running = false;
            console.log('[INFO] SimpleServer.stop: Server stopped');
        });
    }
}
exports.SimpleServer = SimpleServer;
