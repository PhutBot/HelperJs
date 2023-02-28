import * as http from 'http';
import * as https from 'https';
export var RequestProtocol;
(function (RequestProtocol) {
    RequestProtocol["HTTP"] = "HTTP";
    RequestProtocol["HTTPS"] = "HTTPS";
})(RequestProtocol || (RequestProtocol = {}));
export var RequestMethod;
(function (RequestMethod) {
    RequestMethod["DELETE"] = "DELETE";
    RequestMethod["GET"] = "GET";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
})(RequestMethod || (RequestMethod = {}));
export const RequestMethodsAllowingBody = [
    RequestMethod.PUT,
    RequestMethod.POST,
    RequestMethod.PATCH
];
export class Body {
    constructor(data) { this.data = data; }
    raw() { return Promise.resolve(this.data); }
    text() { return Promise.resolve(`${this.data.toString()}`); }
    json() { return Promise.resolve(JSON.parse(this.data.toString())); }
}
// PhutBot PLEASE remember to be careful when debugging this class on stream
export function request(settings) {
    var _a, _b;
    settings = Object.assign({
        method: RequestMethod.GET,
        protocol: RequestProtocol.HTTPS,
        port: 443,
        timeout: 3000,
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
        const proto = settings.protocol === RequestProtocol.HTTP ? http : https;
        const req = proto.request({
            path,
            hostname: settings.hostname,
            port: settings.port,
            method: settings.method,
            headers: settings.headers,
            timeout: settings.timeout
        }, (res) => {
            var _a;
            const headers = {};
            Object.entries(res.headers).forEach(([key, val]) => {
                headers[key] = headers[key] || [];
                if (!!val)
                    headers[key].push(...val);
            });
            resolve({
                statusCode: (_a = res.statusCode) !== null && _a !== void 0 ? _a : -1,
                headers,
                body: () => new Promise((resolve, reject) => {
                    const chunks = [];
                    res.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    res.on('end', () => {
                        resolve(new Body(Buffer.concat(chunks)));
                    });
                    res.on('error', (err) => {
                        reject(err);
                    });
                }),
            });
        });
        req.on('error', (err) => {
            reject(new Error(`request - ${err.message}`));
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
//# sourceMappingURL=Request.js.map