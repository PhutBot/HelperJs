"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const decorators_1 = require("../src/Https/decorators");
src_1.Env.load('.env');
const hostname = new src_1.Env.EnvBackedValue('HOSTNAME');
const port = new src_1.Env.EnvBackedValue('PORT');
const server = new src_1.Https.SimpleServer({
    hostname: hostname,
    port: port
});
let TestHandler = class TestHandler {
    getTest(req, res, opt) {
        res.writeHead(200);
        res.end('Testing one two');
    }
};
__decorate([
    (0, decorators_1.requestMapping)({ location: '/one', method: 'GET' })
], TestHandler.prototype, "getTest", null);
TestHandler = __decorate([
    (0, decorators_1.requestMapping)({ location: '/test' })
], TestHandler);
server.mapHandler(TestHandler);
// server.mapHandler(TestHandler.getTest);
// server.unmapHandler(TestHandler.getTest);
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