import * as http from 'http';
import * as https from 'https';
import { PathParams } from './PathMatcher';

export enum RequestProtocol {
    HTTP = 'HTTP',
    HTTPS = 'HTTPS'
}

export enum RequestMethod {
    DELETE = 'DELETE',
    GET = 'GET',
    PATCH = 'PATCH',
    POST = 'POST',
    PUT = 'PUT'
}

export const RequestMethodsAllowingBody = [
    RequestMethod.PUT,
    RequestMethod.POST,
    RequestMethod.PATCH
];

export interface RequestSettings {
    protocol?:RequestProtocol|string;
    method?:RequestMethod|string;
    hostname:string;
    port?:number;
    uri:string;
    query?:object;
    headers?:any;
    body?:string;
}

export type Headers = Record<string, string[]>;
export type QueryParams = Record<string, string[]>;
export class Body {
    private data:string;
    constructor(data:string) {this.data = data;}
    text() { return Promise.resolve(this.data); }
    json() { return Promise.resolve(JSON.parse(this.data)); }
}

export interface HttpRequest {
    method:RequestMethod;
    url:URL;
    path:string;
    pathParams:PathParams;
    queryParams:QueryParams;
    headers:Headers;
    body:()=>Promise<Body>;
}

export interface HttpResponse {
    statusCode:number;
    headers?:Headers;
    body:()=>Promise<Body>;
}

// PhutBot PLEASE remember to be careful when debugging this class on stream
export function request(settings:RequestSettings):Promise<HttpResponse> {
    settings = Object.assign({
        method: RequestMethod.GET,
        protocol: RequestProtocol.HTTPS,
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
        const proto = (settings.protocol as RequestProtocol) === RequestProtocol.HTTP ? http : https;
        const req = proto.request({
            path,
            hostname: settings.hostname,
            port: settings.port,
            method: settings.method as string,
            headers: settings.headers,
        }, res => {
            const headers = {} as Headers;
            Object.entries(res.headers).forEach(([key, val]) => {
                headers[key] = headers[key] || [];
                if (!!val) headers[key].push(...val);
            });

            resolve({
                statusCode: res.statusCode ?? -1,
                headers,
                body: () => new Promise((resolve, reject) => {
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        resolve(new Body(body));
                    });
                    res.on('error', (err) => {
                        reject(err);
                    });
                })
            });
        });

        req.on('error', err => {
            reject(new Error(`request - ${err}`));
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