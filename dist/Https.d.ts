export function request({ method, hostname, port, uri, query, headers, body, protocol }?: {
    method: any;
    hostname: any;
    port: any;
    uri: any;
    query: any;
    headers: any;
    body: any;
    protocol: any;
}): Promise<any>;
export class SimpleServer {
    constructor(settings?: {});
    _running: boolean;
    _settings: {
        hostname: string;
        port: number;
    };
    handler404: (url: any, req: any, res: any) => void;
    handler500: (url: any, req: any, res: any) => void;
    _sockets: any[];
    _handlers: {
        GET: {};
        POST: {};
    };
    _server: any;
    get running(): boolean;
    get port(): number;
    get hostname(): string;
    get address(): string;
    defineHandler(method: any, path: any, handler: any): void;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=Https.d.ts.map