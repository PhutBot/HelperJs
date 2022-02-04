"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../src/Test/TestRunner");
(0, TestRunner_1.RunTests)('../dist/test', '../../');
// import * as http from 'http';
// import { Env, Https, Millis } from '../src';
// import { requestMapping } from '../src/Https/decorators';
// Env.load('.env');
// const hostname = new Env.EnvBackedValue('HOSTNAME');
// const port = new Env.EnvBackedValue('PORT');
// const server = new Https.SimpleServer({
//     hostname: hostname,
//     port: port
// });
// @requestMapping({ location: '/test' })
// class TestHandler {
//     @requestMapping({ location: '/one', method: 'GET' })
//     static getTest(request:Https.HttpRequest) {
//         return Promise.resolve({
//             statusCode: 200,
//             body: 'Testing one two'
//         });
//     }
// }
// server.mapHandler(TestHandler);
// server.mapHandler(TestHandler.getTest);
// server.unmapHandler(TestHandler.getTest);
// server.defineHandler(Https.RequestMethod.GET, '/', async (request) => {
//     return {
//         statusCode: 200,
//         body: 'Welcome to phuthub'
//     };
// });
// server.defineHandler(Https.RequestMethod.GET, '/echo/{location}', async (request) => {
//     return {
//         statusCode: 200,
//         body: request.pathParams['location']
//     };
// });
// server.defineHandler(Https.RequestMethod.POST, '/stop', (request) => new Promise((resolve, reject) => {
//     request.body()
//         .then((body) => body.json())
//         .then((text) => {
//             console.log(text);
//             setTimeout(() => {
//                 server.unmapDirectory('/dir');
//                 server.stop();
//             }, Millis.fromSec(3));
//             resolve({
//                 statusCode: 200,
//                 body: 'Stopping the server'
//             });
//         });
// }));
// server.defineHandler('GET', '/stop', (request) => new Promise((resolve, reject) => {
//     request.body()
//         .then((body) => body.json())
//         .then((text) => {
//             console.log(text);
//             setTimeout(() => {
//                 server.unmapDirectory('/dir');
//                 server.stop();
//             }, Millis.fromSec(3));
//             resolve({
//                 statusCode: 200,
//                 body: 'Stopping the server'
//             });
//         });
// }));
// server.mapDirectory('./www', { alias: '/dir' });
// server.start();
//# sourceMappingURL=index.js.map