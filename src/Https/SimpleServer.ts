import * as http from 'http';
import * as logger from 'npmlog';
import * as fs from 'fs';
import { Socket } from 'net';
import { EnvBackedValue } from '../Env';
import { RequestMethod, RequestMethodsAllowingBody } from './Request';
import { HttpError, InternalServerError, PageNotFoundError } from './Error';
import { PathMatcher } from './PathMatcher';

interface RequestOptions {
    url:URL;
    argMap?:{};
    err?:HttpError;
}

interface HandlerRecord {
    matcher:PathMatcher;
    handler:RequestHandler;
}


export type RequestHandler = (req:http.IncomingMessage, res:http.ServerResponse, options:RequestOptions) => void;
export type HandlerMap = Record<RequestMethod,Record<string,HandlerRecord>>;

export interface ServerSettings {
    hostname?:string|EnvBackedValue;
    port?:number|EnvBackedValue;
    useCache?:boolean|EnvBackedValue;
}

export class SimpleServer {
    readonly hostname:string;
    readonly port:number;
    readonly useCache:boolean;

    private alias2Dir:Record<string,string> = {};
    private dir2Alias:Record<string,string> = {};
    private cachedFiles:Record<string,string|Buffer> = {};

    private server:http.Server;
    private sockets:Array<Socket> = [];
    private handlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
    private errorHandlers:Record<number,RequestHandler> = {};    
    private _running:boolean = false;

    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }

    constructor(settings:ServerSettings = {}) {
        this.hostname = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname) ?? '0.0.0.0';
        this.port = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port) ?? 8080;
        this.useCache = ((settings.useCache instanceof EnvBackedValue) ? settings.useCache.asBool() : settings.useCache) ?? true;

        this.server = http.createServer((req:http.IncomingMessage, res:http.ServerResponse) => {
            const url = new URL(req.url ?? 'localhost', `http://${req.headers.host}`);
            try {
                const method = req.method as RequestMethod;
                const { handler, options } = this._getHandler(method, url);
                if (RequestMethodsAllowingBody.includes(method)) {
                    options.body = () => {
                        return new Promise((res) => {
                            let body = '';
                            req.on('data', (chunk) => body += chunk);
                            req.on('end', () => {
                                res({
                                    text: () => Promise.resolve(body),
                                    json: () => Promise.resolve(JSON.parse(body)),
                                })
                            });
                        });
                    };
                }
                handler(req, res, options);
            } catch (err) {
                try {
                    this._handleError(url, req, res,
                        (err instanceof HttpError) ? err : new InternalServerError(`${err}`));
                } catch (fatal) {
                    logger.error('SimpleServer', `[FATAL ERROR]: ${fatal}`);
                    throw fatal;
                }
            }
        });

        this.server.on('connection', (socket:Socket) => {
            this.sockets.push(socket);
        });
    }

    mapDirectory(dirName:string, options:{ alias?:string, force?:boolean, cache?:boolean } = {}) {
        dirName = dirName.endsWith('/') ? dirName : `${dirName}/`;
        options.cache = options.cache === undefined ? true : options.cache;
        const _alias = PathMatcher.prepPath(options.alias ?? dirName.replace(/^\./, ''));

        this.dir2Alias[dirName] = _alias;
        this.alias2Dir[_alias] = dirName;
        
        this.defineHandler(RequestMethod.GET, `${_alias}/*`,
            (_:http.IncomingMessage, res:http.ServerResponse, requestOptions:RequestOptions) => {
                const path = requestOptions.url.pathname.replace(_alias, this.alias2Dir[_alias]);
                
                let file = null; // TODO: files should only be cached once even if the path is "different"
                if (this.useCache && !!options.cache && path in this.cachedFiles) {
                    file = this.cachedFiles[path];
                } else if (fs.existsSync(path)) {
                    const stat = fs.lstatSync(path);
                    if (stat.isFile()) {
                        if (path.endsWith('.html')) {
                            res.setHeader('content-type', 'text/html');
                        } else if (path.endsWith('.js')) {
                            res.setHeader('content-type', 'application/javascript');
                        } else if (path.endsWith('.css')) {
                            res.setHeader('content-type', 'text/css');
                        } else {
                            res.setHeader('content-type', 'text/plain');
                        }
                        file = fs.readFileSync(`./${path}`);
                    } else if (stat.isDirectory()) {
                        if (fs.existsSync(`./${path}/index.html`)) {
                            res.setHeader('content-type', 'text/html');
                            file = fs.readFileSync(`./${path}/index.html`, 'utf8');
                        } else if (fs.existsSync(`./${path}/index.js`)) {
                            res.setHeader('content-type', 'application/javascript');
                            file = fs.readFileSync(`./${path}/index.js`, 'utf8');
                        }
                    } else {
                        throw new Error('how is this not a file or a directory??');
                    }
                    if (this.useCache && !!options.cache && !!file) {
                        this.cachedFiles[path] = file;
                    }
                } else if (fs.existsSync(path + '.html')) {
                    res.setHeader('content-type', 'text/html');
                    file = fs.readFileSync(`./${path}.html`, 'utf8');
                    if (this.useCache && !!options.cache) {
                        this.cachedFiles[path] = file;
                    }
                }
                
                if (!file) {
                    throw new PageNotFoundError(requestOptions.url);
                } else {
                    res.writeHead(200);
                    res.end(file);
                }
            }, options);
    }

    unmapDirectory(alias:string) {
        this.removeHandler(RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }

    defineHandler(method:string|RequestMethod, path:string, handler:RequestHandler, options:{ force?:boolean } = {}) {
        const matcher = new PathMatcher(path);
        if (matcher.path in this.handlers[method as RequestMethod]) {
            if (!!options.force) {
                logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            } else {
                logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        
        logger.verbose('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method as RequestMethod][path] = { matcher, handler };
    }
    
    removeHandler(method:string|RequestMethod, path:string) {
        delete this.handlers[method as RequestMethod][PathMatcher.prepPath(path)];
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
            } else {
                this.sockets.forEach(socket => socket.destroy());
                this.server.close(() => {
                    logger.info('SimpleServer', 'server stopped');
                    this._running = false;
                    res(true);
                });
            }
            
        });
    }

    _getHandler(method:RequestMethod, url:URL) {
        const path = url.pathname;
        logger.http('SimpleServer', `${method} - ${path}`);
        
        const record:HandlerRecord|null = Object.values(this.handlers[method])
            .reduce((pre:HandlerRecord|null, cur:HandlerRecord) => {
                if (cur.matcher.match(path).isMatch) {
                    if (!pre) {
                        return cur;
                    } else if (cur.matcher.isWild !== pre.matcher.isWild) {
                        return cur.matcher.isWild ? pre : cur;
                    } else if (cur.matcher.isDynamic !== pre.matcher.isDynamic) { // TODO: this may need to be a counter
                        return cur.matcher.isDynamic ? pre : cur;
                    } else {
                        return cur.matcher.path.length < pre.matcher.path.length ? pre : cur;
                    }
                }
                return pre;
            }, null);
        
        if (!!record) {
            const match = record.matcher.match(path);
            return {
                handler: record.handler,
                options: { url, vars: match.vars,
                    body:() => Promise.resolve({ text: () => Promise.resolve(''), json: () => Promise.resolve(null) }) }
            };
        } else {
            throw new PageNotFoundError(url);
        }
    }

    _handleError(url:URL, req:http.IncomingMessage, res:http.ServerResponse, err:HttpError) {
        if (err.statusCode in this.errorHandlers) {
            this.errorHandlers[err.statusCode](req, res, { url, err });
        } else {
            logger.error('SimpleServer', `[${err.statusCode}] ${err.message}`);
            res.writeHead(err.statusCode);
            res.end(`Error ${err.statusCode}: ${err.description}`);
        }
    }
}

function pathToPattern(path:string) {
    const map:Record<number,string> = {};
    const regex = /\{([_a-zA-Z][_a-zA-Z0-9])\}/g;
    const parts = path.split('/');
    parts.forEach((part, idx, arr) => {
        if (part.startsWith('{')) {
            if (part.endsWith('}')) {
                part = part.toLocaleLowerCase();
                map[idx] = part;
            } else {
                throw new Error('invalid wild handler pattern');
            }
        }
    });
    return {
        path: parts,
        map
    };
}