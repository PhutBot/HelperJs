import * as http from 'http';
import { Env, Https, Millis } from '../src';
import { requestMapping } from '../src/Https/decorators';

Env.load('.env');
const hostname = new Env.EnvBackedValue('HOSTNAME');
const port = new Env.EnvBackedValue('PORT');

const server = new Https.SimpleServer({
    hostname: hostname,
    port: port
});

@requestMapping({ location: '/test' })
class TestHandler {
    @requestMapping({ location: '/one', method: 'GET' })
    static getTest(req:http.IncomingMessage, res:http.ServerResponse, opt:any) {
        res.writeHead(200);
        res.end('Testing one two');
    }
}

server.mapHandler(TestHandler);
server.mapHandler(TestHandler.getTest);
server.unmapHandler(TestHandler.getTest);

server.defineHandler(Https.RequestMethod.GET, '/', (req:http.IncomingMessage, res:http.ServerResponse) => {
    res.writeHead(200);
    res.end('Welcome to phuthub');
});

server.defineHandler(Https.RequestMethod.GET, '/echo/{location}', (req:http.IncomingMessage, res:http.ServerResponse, options:any) => {
    res.writeHead(200);
    res.end(options.vars['location']);
});

server.defineHandler(Https.RequestMethod.POST, '/stop', (req:http.IncomingMessage, res:http.ServerResponse, opt:any) => {
    res.writeHead(200);
    res.end('Stopping the server');
    opt.body()
        .then((body:any) => body.json())
        .then(console.log);
    setTimeout(() => {
        server.unmapDirectory('/dir');
        server.stop();
    }, Millis.fromSec(3));
});

server.defineHandler('GET', '/stop', (req:http.IncomingMessage, res:http.ServerResponse, opt:any) => {
    res.writeHead(200);
    res.end('Stopping the server');
    opt.body()
        .then((body:any) => body.json())
        .then(console.log);
    setTimeout(() => {
        server.unmapDirectory('/dir');
        server.stop();
    }, Millis.fromSec(3));
});

server.mapDirectory('./www', { alias: '/dir' });
server.start();
