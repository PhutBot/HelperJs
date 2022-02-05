import * as http from 'http';
import * as fs from 'fs';
import { Socket } from 'net';
import { EnvBackedValue } from '../Env';
import { RequestMethod, Headers, QueryParams, Body, HttpRequest } from './Request';
import { HttpError, InternalServerError, PageNotFoundError } from './Error';
import { PathMatcher } from './PathMatcher';
import {  } from '.';
import { Logger } from '../Log';

interface HandlerRecord {
    matcher:PathMatcher;
    handler:RequestHandler;
}
export interface HandlerResponse {
    statusCode:number;
    headers?:Headers;
    body?:string;
}

export type RequestHandler = (request:HttpRequest) => Promise<HandlerResponse>;
export type HandlerMap = Record<RequestMethod,Record<string,HandlerRecord>>;

export interface ServerSettings {
    hostname?:string|EnvBackedValue;
    port?:number|EnvBackedValue;
    useCache?:boolean|EnvBackedValue;
    loglevel?:string;
}

export class SimpleServer {
    readonly hostname:string;
    readonly port:number;
    readonly useCache:boolean;

    private alias2Dir:Record<string,string> = {};
    private dir2Alias:Record<string,string> = {};
    private cachedFiles:Record<string,string> = {};

    private logger:Logger;
    private server:http.Server;
    private sockets:Array<Socket> = [];
    private handlers:HandlerMap = { DELETE:{}, GET:{}, PATCH:{}, POST:{}, PUT:{} };
    private errorHandlers:Record<number,RequestHandler> = {};
    private _running:boolean = false;

    get running() { return this._running; }
    get address() { return `http://${this.hostname}:${this.port}`; }

    constructor(settings:ServerSettings = {}) {
        this.logger = new Logger(settings.loglevel ?? 'silent');
        this.hostname = ((settings.hostname instanceof EnvBackedValue) ? settings.hostname.get() : settings.hostname) ?? '0.0.0.0';
        this.port = ((settings.port instanceof EnvBackedValue) ? settings.port.asInt() : settings.port) ?? 8080;
        this.useCache = ((settings.useCache instanceof EnvBackedValue) ? settings.useCache.asBool() : settings.useCache) ?? true;

        this.server = http.createServer(this._rootHandler.bind(this));

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
            (request:HttpRequest) => new Promise((resolve, reject) => {
                const path = request.url.pathname.replace(_alias, this.alias2Dir[_alias]);
                const headers = {} as Headers;
                
                let contentType = '';
                let file:string = ''; // TODO: files should only be cached once even if the path is "different"
                if (this.useCache && !!options.cache && path in this.cachedFiles) {
                    file = this.cachedFiles[path];
                } else if (fs.existsSync(path)) {
                    const stat = fs.lstatSync(path);
                    if (stat.isFile()) {
                        if (path.endsWith('.html')) {
                            contentType = 'text/html';
                        } else if (path.endsWith('.js')) {
                            contentType = 'application/javascript';
                        } else if (path.endsWith('.css')) {
                            contentType = 'text/css';
                        } else {
                            contentType = 'text/plain';
                        }
                        file = fs.readFileSync(`./${path}`, 'utf8');
                    } else if (stat.isDirectory()) {
                        if (fs.existsSync(`./${path}/index.html`)) {
                            contentType = 'text/html';
                            file = fs.readFileSync(`./${path}/index.html`, 'utf8');
                        } else if (fs.existsSync(`./${path}/index.js`)) {
                            contentType = 'application/javascript';
                            file = fs.readFileSync(`./${path}/index.js`, 'utf8');
                        }
                    } else {
                        reject(new InternalServerError('how is this not a file or a directory??'));
                    }
                    
                    if (this.useCache && !!options.cache && !!file) {
                        this.cachedFiles[path] = file;
                    }
                } else if (fs.existsSync(path + '.html')) {
                    contentType = 'text/html';
                    file = fs.readFileSync(`./${path}.html`, 'utf8');
                    if (this.useCache && !!options.cache) {
                        this.cachedFiles[path] = file;
                    }
                }
                
                headers['content-type'] = [contentType];
                if (!file) {
                    reject(new PageNotFoundError(request.url));
                } else {
                    resolve({
                        statusCode: 200,
                        headers,
                        body: file
                    });
                }
            }), options);
    }

    unmapDirectory(alias:string) {
        this.removeHandler(RequestMethod.GET, `${alias}/*`);
        delete this.dir2Alias[this.alias2Dir[alias]];
        delete this.alias2Dir[alias];
    }

    mapHandler(clazz:Function) {
        const decorated = clazz as any;
        if (decorated.__decorators.hasOwnProperty('requestMapping')) {
            if (!!decorated.__decorators.requestMapping.method) {
                const mapping = decorated.__decorators.requestMapping;
                this.defineHandler(mapping.method, mapping.location, decorated);
            } else {
                Object.entries(Object.getOwnPropertyDescriptors(clazz)).forEach(([ name, desc ]) => {
                    if (typeof desc.value === 'function' && desc.value.__decorators.hasOwnProperty('requestMapping')) {
                        const parentMap = decorated.__decorators.requestMapping;
                        const mapping = desc.value.__decorators.requestMapping;
                        const path = [parentMap.location, mapping.location].join('/');
                        this.defineHandler(mapping.method, path, desc.value);
                    }
                });
            }
        }
    }

    unmapHandler(clazz:Function) {
        const decorated = clazz as any;
        if (decorated.__decorators.hasOwnProperty('requestMapping')) {
            if (!!decorated.__decorators.requestMapping.method) {
                const mapping = decorated.__decorators.requestMapping;
                this.removeHandler(mapping.method, mapping.location);
            } else {
                Object.entries(Object.getOwnPropertyDescriptors(clazz)).forEach(([ name, desc ]) => {
                    if (typeof desc.value === 'function' && desc.value.__decorators.hasOwnProperty('requestMapping')) {
                        const parentMap = decorated.__decorators.requestMapping;
                        const mapping = desc.value.__decorators.requestMapping;
                        const path = [parentMap.location, mapping.location].join('/');
                        this.removeHandler(mapping.method, path);
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
        
        this.logger.verbose('SimpleServer', `created mapping for ${matcher.path}`);
        this.handlers[method as RequestMethod][matcher.path] = { matcher, handler };
    }
    
    removeHandler(method:string|RequestMethod, path:string) {
        delete this.handlers[method as RequestMethod][PathMatcher.prepPath(path)];
    }

    start() {
        return new Promise((res, rej) => {
            if (this._running) {
                this.logger.warn('SimpleServer', 'server already started');
                rej('server already started');
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
                rej('server already stopped');
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
                if (!!val) headers[key].push(...val);
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
