import * as fs from 'fs';
import * as Millis from './Millis';
export class Env {
    static get(name) {
        return process.env[name];
    }
    static set(name, value) {
        if (Env.vars.includes(name))
            Env.modified = true;
        process.env[name] = value;
    }
    static load(file) {
        Env.filename = file;
        const filecontent = fs.readFileSync(file).toString();
        Env.vars = [];
        filecontent.split('\n')
            .filter(line => !!line.trim())
            .forEach(line => {
            const split = line.indexOf('=');
            if (split > 0) {
                const key = line.slice(0, split);
                const value = line.slice(split + 1);
                Env.vars.push(key);
                process.env[key] = value;
            }
        });
    }
    static save() {
        if (!!Env.filename && Env.modified) {
            let filecontent = '';
            Env.vars.forEach(key => {
                const value = process.env[key];
                filecontent += `${key}=${value}\n`;
            });
            fs.writeFileSync(Env.filename, filecontent);
            Env.modified = false;
        }
    }
    static waitForVar(name, timeout = -1) {
        return new Promise((resolve, reject) => {
            let counter = 0;
            const interval = setInterval(() => {
                if (!!Env.get(name)) {
                    clearInterval(interval);
                    resolve(Env.get(name));
                }
                else if (timeout > 0 && counter > timeout) {
                    reject(`Env.waitForVar - timed out waiting for environment var '${name}'`);
                }
                counter += 100;
            }, 100);
        });
    }
}
Env.modified = false;
Env.vars = [];
export class EnvBackedValue {
    constructor(key) {
        this.key = key;
    }
    get() {
        return Env.get(this.key);
    }
    set(val) {
        Env.set(this.key, val);
        if (!EnvBackedValue.saveTimeout) {
            EnvBackedValue.saveTimeout = setTimeout(() => {
                Env.save();
                EnvBackedValue.saveTimeout = undefined;
            }, Millis.fromSec(5));
        }
    }
}
//# sourceMappingURL=Env.js.map