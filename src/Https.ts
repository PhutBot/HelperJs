import * as http from 'http';
import * as https from 'https';
import { Socket } from 'net';
import { EnvBackedValue } from './Env';

export interface RequestSettings {
    method?:string;
    hostname:string;
    port?:number;
    uri:string;
    query?:object;
    headers?:any;
    body?:string;
    protocol?:string;
}

// PhutBot PLEASE remember to be careful when debugging this class on stream
export function request(settings:RequestSettings) {
    settings = Object.assign({
        method: 'GET',
        protocol: 'HTTPS',
        port: 443
    }, settings);

    let path:string = settings.uri;
    if (!!settings.query) {
        const entries = Object.entries(settings.query);
        if (!path.includes('?') && entries.length > 0) {
            let [key, val] = entries.shift() ?? ['', ''];
            while (!val && entries.length > 0) {
                [key, val] = entries.shift() ?? ['', ''];
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
            let data:any = [];
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
            } else {
                req.write(settings.body);
            }
        }

        req.end();
    });
}

export interface ServerSettings {
    hostname?:string|EnvBackedValue;
    port?:number|EnvBackedValue;
}

export class SimpleServer {
    readonly hostname:string;
    readonly port:number;

    private _running:boolean = false;
    private _errHandlers:Record<string, Function> = {
        '404': (url:URL, req:http.IncomingMessage, res:http.ServerResponse) => {
            res.writeHead(404);
            res.end('Error 404: Page not found');
        },
        '500': (url:URL, req:http.IncomingMessage, res:http.ServerResponse) => {
            res.writeHead(500);
            res.end('Error 500: Internal server error');
        }
    };
    private _handlers:any = { GET: {}, POST: {} };
    private _sockets:Array<Socket> = [];
    private _server:http.Server;

    constructor(settings:ServerSettings = {}) {
        this.hostname = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname) ?? '0.0.0.0';
        this.port = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port) ?? 8080;

        this._server = http.createServer((req:http.IncomingMessage, res:http.ServerResponse) => {
            const methodName = (req.method ?? 'GET');
            const url = new URL(req.url ?? 'localhost', `http://${req.headers.host}`);
            
            let handler = this._errHandlers['404'];
            try {
                if (methodName in this._handlers) {
                    const method = this._handlers[methodName];
                    if (url.pathname in method) {
                        handler = method[url.pathname];
                    }
                }
            } catch (err) {
                handler = this._errHandlers['500'];
                console.error(`[ERROR] SimpleServer.SimpleServer: 1 - ${err}`);
            }
            
            try {
                handler(url, req, res);
            } catch (err) {
                try {
                    console.error(`[ERROR] SimpleServe.SimpleServer: 2 - ${err}`);
                    this._errHandlers['500'](url, req, res);
                } catch (err2) {
                    console.error(`[FATAL] SimpleServe.SimpleServer: 3 - ${err2}`);
                    process.exit(1);
                }
            }
        });

        this._server.on('connection', (socket:Socket) => {
            this._sockets.push(socket);
        });
    }

    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }

    defineHandler(method:string, path:string, handler:Function) {
        if (!(method in this._handlers)) {
            throw 'SimpleServer.defineHandler - unsupported method';
        } else if (!(path in this._handlers[method])) {
            throw `SimpleServer.defineHandler - method already has endpoint ${path}`;
        }
        this._handlers[method][path] = handler;
    }

    start() {
        if (this._running) {
            return;
        }

        this._server.listen(this.port, this.hostname, () => {
            this._running = true;
            console.log(`[INFO] SimpleServer.start: Server started @ ${this.address}`);
        });
    }

    stop() {
        if (!this._running) {
            return;
        }
        
        this._sockets.forEach(socket => {
            socket.destroy();
        });
        
        this._server.close(() => {
            this._running = false;
            console.log('[INFO] SimpleServer.stop: Server stopped');
        });
    }
}
