import * as http from 'http';
import { Env, Https, Millis } from '../src';

Env.load('.env');
const hostname = new Env.EnvBackedValue('HOSTNAME');
const port = new Env.EnvBackedValue('PORT');

const server = new Https.SimpleServer({
    hostname: hostname,
    port: port
});

server.defineHandler(Https.RequestMethod.GET, '/', (req:http.IncomingMessage, res:http.ServerResponse) => {
    res.writeHead(200);
    res.end('Welcome to phuthub');
});

server.defineHandler(Https.RequestMethod.GET, '/echo/{location}', (req:http.IncomingMessage, res:http.ServerResponse, options:any) => {
    res.writeHead(200);
    res.end(options.vars['location']);
});

server.defineHandler(Https.RequestMethod.GET, '/stop', (req:http.IncomingMessage, res:http.ServerResponse) => {
    res.writeHead(200);
    res.end('Stopping the server');
    setTimeout(() => {
        server.unmapDirectory('/dir');
        server.stop();
    }, Millis.fromSec(3));
});

server.mapDirectory('./www', '/dir');
server.start();
