import * as Millis from './src/Millis';
import { Env } from './dist/index';


Env.Env.load('.env');

const foo = new Env.EnvBackedValue('FOO');
console.log(foo.get());

foo.set('FOOBAR');
console.log(foo.get());

foo.set('BAR');
setTimeout(() => {
    console.log(foo.get());
}, Millis.fromSec(7));

