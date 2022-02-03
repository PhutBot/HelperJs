"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
src_1.Env.load('.env');
const hostname = new src_1.Env.EnvBackedValue('HOSTNAME');
const port = new src_1.Env.EnvBackedValue('PORT');
const server = new src_1.Https.SimpleServer({
    hostname: hostname,
    port: port
});
server.defineHandler(src_1.Https.RequestMethod.GET, '/', (req, res) => {
    res.writeHead(200);
    res.end('Welcome to phuthub');
});
server.defineHandler(src_1.Https.RequestMethod.GET, '/echo/{location}', (req, res, options) => {
    res.writeHead(200);
    res.end(options.vars['location']);
});
server.defineHandler(src_1.Https.RequestMethod.POST, '/stop', (req, res, opt) => {
    res.writeHead(200);
    res.end('Stopping the server');
    opt.body()
        .then((body) => body.json())
        .then(console.log);
    setTimeout(() => {
        server.unmapDirectory('/dir');
        server.stop();
    }, src_1.Millis.fromSec(3));
});
server.defineHandler('GET', '/stop', (req, res, opt) => {
    res.writeHead(200);
    res.end('Stopping the server');
    opt.body()
        .then((body) => body.json())
        .then(console.log);
    setTimeout(() => {
        server.unmapDirectory('/dir');
        server.stop();
    }, src_1.Millis.fromSec(3));
});
server.mapDirectory('./www', { alias: '/dir' });
server.start();
//# sourceMappingURL=index.js.map