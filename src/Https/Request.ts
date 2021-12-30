import * as http from 'http';
import * as https from 'https';

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

export interface RequestSettings {
    protocol?:RequestProtocol;
    method?:RequestMethod;
    hostname:string;
    port?:number;
    uri:string;
    query?:object;
    headers?:any;
    body?:string;
}

// PhutBot PLEASE remember to be careful when debugging this class on stream
export function request(settings:RequestSettings) {
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
        const proto = settings.protocol === RequestProtocol.HTTP ? http : https;
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