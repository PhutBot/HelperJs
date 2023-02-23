import * as http from 'http';
import * as fs from 'fs';
import * as events from 'events';
import { Socket } from 'net';
import { EnvBackedValue } from '../Env';
import { RequestMethod, Headers, QueryParams, Body, HttpRequest } from './Request';
import { ErrorHttp } from './Errors/Error';
import { ErrorHttp404NotFound } from './Errors/4XX';
import { ErrorHttp500Internal } from './Errors/5XX';
import { PathMatcher } from './PathMatcher';
import { Logger, LogLevel } from '../Log';
import { getMetadata } from '../Meta/Metadata';
import { Middleware, MiddlewareStage } from './Middleware';
import { WebSocketConnection } from './WebSocket';

interface HandlerRecord {
    matcher:PathMatcher;
    handler:RequestHandler;
}
export interface HandlerResponse {
    statusCode:number;
    headers?:Headers;
    body?:string|Buffer;
}

export type RequestHandler = (request:HttpRequest, model?:{}) => Promise<HandlerResponse>;
export type HandlerMap = Record<RequestMethod,Record<string,HandlerRecord>>;

export type PreProcessor = (model:{}|Function|undefined, view:string) => string;
interface CachedFile {
    type:string,
    content:string|Buffer
}

export interface ServerSettings {
    hostname?:string|EnvBackedValue;
    port?:number|EnvBackedValue;
    useCache?:boolean|EnvBackedValue;
    loglevel?:LogLevel;
    preprocessor?: PreProcessor;
}

export class SimpleServer {
    readonly hostname:string;
    readonly port:number;
    readonly useCache:boolean;

    private alias2Dir:Record<string,string> = {};
    private dir2Alias:Record<string,string> = {};
    private cachedFiles:Record<string,CachedFile> = {};
    
    private eventEmitter:events.EventEmitter = new events.EventEmitter();
    private logger:Logger;
    private server:http.Server;
    private sockets:Array<Socket> = [];
    public websockets:Array<WebSocketConnection> = [];
    private handlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
    // private errorHandlers:Record<number,RequestHandler> = {};
    private _running:boolean = false;

    private middlewares:Record<MiddlewareStage,Array<Middleware>> = { PRE_PROCESSOR:[], POST_PROCESSOR:[] };
    private preprocessor:PreProcessor = (_, view) => view;

    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }

    constructor(settings:ServerSettings = {}) {
        this.logger = new Logger();
        if (settings.loglevel)
            this.logger.setLevel(settings.loglevel)
    
        this.hostname = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname) ?? '0.0.0.0';
        this.port = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port) ?? 8080;
        this.useCache = ((settings.useCache instanceof EnvBackedValue) ? settings.useCache.asBool() : settings.useCache) ?? true;

        if (!!settings.preprocessor)
            this.preprocessor = settings.preprocessor;

        this.server = http.createServer(this._rootHandler.bind(this));

        this.server.on('connection', (socket:Socket) => {
            this.sockets.push(socket);
            this.eventEmitter.emit('simple-server-connection', { detail: socket });
        });
        this.server.on('upgrade', (req:http.IncomingMessage, socket:Socket) => {
            if (req.headers['upgrade'] !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            const request = this._translateRequest(req);
            const ws = new WebSocketConnection(this.websockets.length, request, socket);
            ws.on('text', (data:string) => {
                this.eventEmitter.emit('simple-websocket-msg', { detail: { ws, data }});
            });
            this.websockets.push(ws);
            this.eventEmitter.emit('simple-websocket-connection', { detail: ws });
        });
    }

    addMiddleware(middleware:Middleware) {
        this.middlewares[middleware.stage].push(middleware);
    }

    addEventListener(eventName:string, handler:Function) {
        this.eventEmitter.addListener(eventName, (...args) => {
            handler(args[0]);
        });
    }

    mapDirectory(dirName:string, options:{ alias?:string, force?:boolean, cache?:boolean, model?:{} } = {}) {
        dirName = dirName.endsWith('/') ? dirName : `${dirName}/`;
        options.cache = options.cache === undefined ? true : options.cache;
        const _alias = PathMatcher.prepPath(options.alias ?? dirName.replace(/^\./, ''));

        this.dir2Alias[dirName] = _alias;
        this.alias2Dir[_alias] = dirName;
        
        this.defineHandler(RequestMethod.GET, `${_alias}/*`,
            (request:HttpRequest) => new Promise((resolve, reject) => {
                const path = request.url.pathname.replace(_alias, this.alias2Dir[_alias]);
                const headers = {} as Headers;
                request.filePath = path;
                
                let encoding:BufferEncoding = 'utf8'
                let file:CachedFile = {
                    type: 'text/plain',
                    content: ''
                };
                // TODO: files should only be cached once even if the path is "different"
                if (this.useCache && !!options.cache && path in this.cachedFiles) {
                    file = this.cachedFiles[path];
                } else if (fs.existsSync(path)) {
                    const stat = fs.lstatSync(path);
                    if (stat.isFile()) {
                        if (path.endsWith('.html')) {
                            file.type = 'text/html';
                        } else if (path.endsWith('.png')) {
                            file.type = 'image/png';
                            encoding = 'binary';
                        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                            file.type = 'image/jpeg';
                            encoding = 'binary';
                        } else if (path.endsWith('.js')) {
                            file.type = 'application/javascript';
                        } else if (path.endsWith('.css')) {
                            file.type = 'text/css';
                        }

                        file.content = Buffer.from(fs.readFileSync(`./${path}`, encoding), encoding);
                    } else if (stat.isDirectory()) {
                        if (fs.existsSync(`./${path}/index.html`)) {
                            file.type = 'text/html';
                            file.content = fs.readFileSync(`./${path}/index.html`, encoding);
                        } else if (fs.existsSync(`./${path}/index.js`)) {
                            file.type = 'application/javascript';
                            file.content = fs.readFileSync(`./${path}/index.js`, encoding);
                        }
                    } else {
                        reject(new ErrorHttp500Internal(request, 'how is this not a file or a directory??'));
                        return;
                    }
                    
                    if (this.useCache && !!options.cache && !!file) {
                        this.cachedFiles[path] = file;
                    }
                } else if (fs.existsSync(path + '.html')) {
                    file.type = 'text/html';
                    file.content = fs.readFileSync(`./${path}.html`, encoding);
                    if (this.useCache && !!options.cache) {
                        this.cachedFiles[path] = file;
                    }
                } else {
                    reject(new ErrorHttp404NotFound(request));
                    return;
                }
                
                headers['content-type'] = [file.type];
                const model = typeof options.model === 'function'
                    ? options.model({ request })
                    : options.model; 
                const body = file.type === 'text/html' && !Buffer.isBuffer(file.content)
                    ? this.preprocessor(model, file.content as string)
                    : file.content;
                resolve({
                    statusCode: 200,
                    headers, body
                });
            }), options);
    }

    unmapDirectory(alias:string) {
        this.removeHandler(RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }

    mapHandler(target:Function) {
        const clazzMeta = getMetadata(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.defineHandler(clazzMeta.method, clazzMeta.location, target as RequestHandler);
            } else {
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

    unmapHandler(target:Function) {
        const clazzMeta = getMetadata(target.prototype, '@RequestMapping');
        if (!!clazzMeta) {
            if (!!clazzMeta.mapping) {
                this.removeHandler(clazzMeta.method, clazzMeta.location);
            } else {
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

    defineHandler(method:string|RequestMethod, path:string, handler:RequestHandler, options:{ force?:boolean } = {}) {
        const matcher = new PathMatcher(path);
        if (matcher.path in this.handlers[method as RequestMethod]) {
            if (!!options.force) {
                this.logger.warn('SimpleServer', `overriding handler ${method} ${matcher.path}`);
            } else {
                this.logger.error('SimpleServer', `method already has endpoint ${matcher.path}`);
                return;
            }
        }
        
        this.logger.http('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method as RequestMethod][matcher.path] = { matcher, handler };
    }
    
    removeHandler(method:string|RequestMethod, path:string) {
        delete this.handlers[method as RequestMethod][PathMatcher.prepPath(path)];
    }

    removeAllHandlers() {
        Object.entries(this.handlers).forEach(([method, handlers]) => {
            Object.entries(handlers).forEach(([path, handler]) => {
                delete this.handlers[method as RequestMethod][PathMatcher.prepPath(path)];
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
            } else {
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

    _getHandler(m:string|RequestMethod, url:URL) {
        const method = m as RequestMethod;
        const path = url.pathname;
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
            this.logger.http('SimpleServer', `${method} - ${path}`);
            const match = record.matcher.match(path);
            return {
                handler: record.handler,
                pathParams: match.vars
            };
        } else {
            return {
                handler: null,
                pathParams: {}
            };
        }
    }

    _translateRequest(req:http.IncomingMessage) {
        const method = req.method as RequestMethod ?? RequestMethod.GET;
        const url = new URL(req.url ?? '', this.address);
        const path = url.pathname;

        const headers:Headers = {};
        Object.entries(req.headers).forEach(([key, val]) => {
            headers[key] = headers[key] || [];
            if (!!val) {
                if (Array.isArray(val))
                    headers[key].push(...val);
                else
                    headers[key].push(val);
            }
        });
        
        const queryParams:QueryParams = {};
        for (const [key, val] of url.searchParams.entries()) {
            queryParams[key] = queryParams[key] || [];
            queryParams[key].push(val);
        }

        const request:HttpRequest = {
            socket: req.socket,
            method,
            url,
            path,
            pathParams: {},
            queryParams,
            headers,
            body: () => new Promise((resolve, reject) => {
                const chunks:Buffer[] = [];
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

    _rootHandler(req:http.IncomingMessage, res:http.ServerResponse) {
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

            handler(request, model).then((response:HandlerResponse) => {
                    response.headers = response.headers || {};
                    this.middlewares[MiddlewareStage.POST_PROCESSOR].forEach(middleware => {
                        middleware.process(model, response);  
                    });
                    if (!response.headers.hasOwnProperty('content-type'))
                        response.headers['content-type'] = [ 'text/plain' ];
                    for (const [key, value] of Object.entries(response.headers)) {
                        res.setHeader(key, value);
                    }
                    res.writeHead(response.statusCode);
                    res.end(response.body);
                }).catch((error:any) => {
                    if (!(error instanceof ErrorHttp)) {
                        error = new ErrorHttp500Internal(request, error instanceof Error
                            ? error.message : `${error}`);
                    }

                    const httpError = error as ErrorHttp;
                    res.writeHead(httpError.statusCode);
                    res.end(httpError.description);
                    this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
                    this.logger.error('SimpleServer', httpError.stack ?? httpError.message);
                });
        } catch (error) {
            if (!(error instanceof ErrorHttp)) {
                const dummyRequest:HttpRequest = {
                    headers: {},
                    method: req.method as RequestMethod ?? RequestMethod.GET,
                    path: '',
                    pathParams: {},
                    queryParams: {},
                    socket: req.socket,
                    url: new URL(req.url ?? '', this.address),
                };
                if (error instanceof Error) {
                    error = new ErrorHttp500Internal(dummyRequest, error.message);
                } else {
                    error = new ErrorHttp500Internal(dummyRequest, `${error}`);
                }
            }

            const httpError = error as ErrorHttp;
            res.writeHead(httpError.statusCode);
            res.end(httpError.description);
            this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
            this.logger.error('SimpleServer', httpError.stack ?? httpError.message);
        }
    }
}
