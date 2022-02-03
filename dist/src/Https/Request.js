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
exports.request = exports.RequestMethod = exports.RequestProtocol = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
var RequestProtocol;
(function (RequestProtocol) {
    RequestProtocol["HTTP"] = "HTTP";
    RequestProtocol["HTTPS"] = "HTTPS";
})(RequestProtocol = exports.RequestProtocol || (exports.RequestProtocol = {}));
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["DELETE"] = "DELETE";
    RequestMethod["GET"] = "GET";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
})(RequestMethod = exports.RequestMethod || (exports.RequestMethod = {}));
// PhutBot PLEASE remember to be careful when debugging this class on stream
function request(settings) {
    var _a, _b;
    settings = Object.assign({
        method: RequestMethod.GET,
        protocol: RequestProtocol.HTTPS,
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
        const proto = settings.protocol === RequestProtocol.HTTP ? http : https;
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
//# sourceMappingURL=Request.js.map