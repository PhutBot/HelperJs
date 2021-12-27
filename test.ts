import * as Millis from './src/Millis';
import { Env, EnvBackedValue } from './src/Env';


Env.load('.env');

const foo = new EnvBackedValue('FOO');
console.log(foo.get());

foo.set('FOOBAR');
console.log(foo.get());

foo.set('BAR');
setTimeout(() => {
    console.log(foo.get());
}, Millis.fromSec(7));

