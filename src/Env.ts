import * as fs from 'fs';
import * as Millis from './Millis';

let modified:boolean = false;
let vars:Array<string> = [];
let filename:string|null = null;

export function get(name:string) {
    return process.env[name];
}

export function set(name:string, value:string) {
    if (vars.includes(name))
        modified = true;
    process.env[name] = value;
}
    
export function load(file:string) {
    filename = file;
    const filecontent = fs.readFileSync(file).toString();

    vars = [];
    filecontent.split('\n')
        .filter(line => !!line.trim())
        .forEach(line => {
            const split = line.indexOf('=');
            if (split > 0) {
                const key = line.slice(0, split);
                const value = line.slice(split+1);
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

export function waitForVar(name:string, timeout=-1) {
    return new Promise((resolve, reject) => {
            let counter = 0;
            const interval = setInterval(() => {
                if (!!get(name)) {
                    clearInterval(interval);
                    resolve(get(name));
                } else if (timeout > 0 && counter > timeout) {
                    reject(`Env.waitForVar - timed out waiting for environment var '${name}'`)
                }
                counter += 100;
            }, 100);
        });
}

export class EnvBackedValue {
    public static timeout:number=Millis.fromSec(5);
    private static saveTimeout?:NodeJS.Timeout;
    
    private key:string;

    constructor(key:string) {
        this.key = key;
    }

    get() {
        return get(this.key);
    }

    set(val:string) {
        set(this.key, val);
        if (!EnvBackedValue.saveTimeout) {
            EnvBackedValue.saveTimeout = setTimeout(() => {
                save();
                EnvBackedValue.saveTimeout = undefined;
            }, EnvBackedValue.timeout);
        }
    }
}
