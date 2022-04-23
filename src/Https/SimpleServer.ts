import * as http from 'http';
import * as fs from 'fs';
import { Socket } from 'net';
import { EnvBackedValue } from '../Env';
import { RequestMethod, Headers, QueryParams, Body, HttpRequest } from './Request';
import { HttpError, InternalServerError, PageNotFoundError } from './Error';
import { PathMatcher } from './PathMatcher';
import { Logger } from '../Log';
import { getMetadata } from '../Meta/Metadata';

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
    loglevel?:string;
    preprocessor?: PreProcessor;
}

export class SimpleServer {
    readonly hostname:string;
    readonly port:number;
    readonly useCache:boolean;

    private alias2Dir:Record<string,string> = {};
    private dir2Alias:Record<string,string> = {};
    private cachedFiles:Record<string,CachedFile> = {};

    private logger:Logger;
    private server:http.Server;
    private sockets:Array<Socket> = [];
    private handlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
    // private errorHandlers:Record<number,RequestHandler> = {};
    private _running:boolean = false;

    private preprocessor:PreProcessor = (_, view) => view;

    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }

    constructor(settings:ServerSettings = {}) {
        this.logger = new Logger(settings.loglevel ?? 'info');
        this.hostname = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname) ?? '0.0.0.0';
        this.port = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port) ?? 8080;
        this.useCache = ((settings.useCache instanceof EnvBackedValue) ? settings.useCache.asBool() : settings.useCache) ?? true;

        if (!!settings.preprocessor)
            this.preprocessor = settings.preprocessor;

        this.server = http.createServer(this._rootHandler.bind(this));

        this.server.on('connection', (socket:Socket) => {
            this.sockets.push(socket);
            dispatchEvent(new CustomEvent('connection', { detail: socket }));
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
                        reject(new InternalServerError('how is this not a file or a directory??'));
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
                }
                
                headers['content-type'] = [file.type];
                if (!file) {
                    reject(new PageNotFoundError(request.url));
                } else {
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
                }
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
        
        this.logger.info('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method as RequestMethod][matcher.path] = { matcher, handler };
    }
    
    removeHandler(method:string|RequestMethod, path:string) {
        delete this.handlers[method as RequestMethod][PathMatcher.prepPath(path)];
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
            } else {
                this.sockets.forEach(socket => socket.destroy());
                this.server.close(() => {
                    this.logger.info('SimpleServer', 'server stopped');
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
            throw new PageNotFoundError(url);
        }
    }

    _rootHandler(req:http.IncomingMessage, res:http.ServerResponse) {
        try {
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
                                resolve(new Body(body));
                            });
                            req.on('error', (err) => {
                                reject(err);
                            });
                        })
                }).then((response:HandlerResponse) => {
                    response.headers = response.headers || {};
                    if (!response.headers.hasOwnProperty('content-type'))
                        response.headers['content-type'] = [ 'text/plain' ];
                    for (const [key, value] of Object.entries(response.headers)) {
                        res.setHeader(key, value);
                    }
                    
                    res.writeHead(response.statusCode);
                    res.end(response.body);
                }).catch((error:any) => {
                    if (!(error instanceof HttpError)) {
                        error = new InternalServerError(error instanceof Error
                            ? error.message : `${error}`);
                    }

                    const httpError = error as HttpError;
                    res.writeHead(httpError.statusCode);
                    res.end(httpError.description);
                    this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
                    this.logger.error('SimpleServer', httpError.stack ?? httpError.message);
                });
        } catch (error) {
            if (!(error instanceof HttpError)) {
                if (error instanceof Error) {
                    error = new InternalServerError(error.message);
                } else {
                    error = new InternalServerError(`${error}`);
                }
            }

            const httpError = error as HttpError;
            res.writeHead(httpError.statusCode);
            res.end(httpError.description);
            this.logger.error('SimpleServer', `[${httpError.statusCode}] ${httpError.description}`);
            this.logger.error('SimpleServer', httpError.stack ?? httpError.message);
        }
    }
}
