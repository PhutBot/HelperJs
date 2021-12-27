"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvBackedValue = exports.Env = void 0;
const fs = __importStar(require("fs"));
const _1 = require(".");
class Env {
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
exports.Env = Env;
Env.modified = false;
Env.vars = [];
class EnvBackedValue {
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
            }, _1.Millis.fromSec(5));
        }
    }
}
exports.EnvBackedValue = EnvBackedValue;
//# sourceMappingURL=Env.js.map