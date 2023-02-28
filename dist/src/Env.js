import * as fs from 'fs';
import * as Millis from "./Millis.js";
let modified = false;
let vars = [];
let filename = null;
export function get(name, def) {
    var _a;
    return (_a = process.env[name]) !== null && _a !== void 0 ? _a : def;
}
export function set(name, value) {
    if (vars.includes(name))
        modified = true;
    process.env[name] = value;
}
export function load(file) {
    filename = file;
    const filecontent = fs.readFileSync(file).toString();
    vars = [];
    filecontent.split(/\r?\n/)
        .filter(line => !!line.trim())
        .forEach(line => {
        const split = line.indexOf('=');
        if (split > 0) {
            const key = line.slice(0, split);
            const value = line.slice(split + 1);
            vars.push(key);
            process.env[key] = value;
        }
    });
}
export function save() {
    if (!!filename && modified) {
        let filecontent = '';
        vars.forEach(key => {
            const value = process.env[key];
            filecontent += `${key}=${value}\n`;
        });
        fs.writeFileSync(filename, filecontent);
        modified = false;
    }
}
export function waitForVar(name, timeout = -1) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
            if (!!get(name)) {
                clearInterval(interval);
                resolve(get(name));
            }
            else if (timeout > 0 && counter > timeout) {
                clearInterval(interval);
                reject(new Error(`Env.waitForVar - timed out waiting for environment var '${name}'`));
            }
            counter += 100;
        }, 100);
    });
}
export class EnvBackedValue {
    constructor(key, def) {
        this.key = key;
        this.def = def;
    }
    get() {
        return get(this.key, this.def);
    }
    asBool() {
        var _a;
        const str = (_a = this.get()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        return str === 'true' || str === 'yes' || str === 'on' || str === '1';
    }
    asInt() {
        var _a;
        return Number.parseInt((_a = this.get()) !== null && _a !== void 0 ? _a : '0');
    }
    asFloat() {
        var _a;
        return Number.parseFloat((_a = this.get()) !== null && _a !== void 0 ? _a : '0');
    }
    set(val) {
        set(this.key, val);
    }
    commit(val) {
        if (!val) {
            val = get(this.key);
        }
        set(this.key, val);
        if (!EnvBackedValue.saveTimeout) {
            EnvBackedValue.saveTimeout = setTimeout(() => {
                save();
                EnvBackedValue.saveTimeout = undefined;
            }, EnvBackedValue.timeout);
        }
    }
}
EnvBackedValue.timeout = Millis.fromSec(5);
//# sourceMappingURL=Env.js.map