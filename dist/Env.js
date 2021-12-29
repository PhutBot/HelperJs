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
exports.EnvBackedValue = exports.waitForVar = exports.save = exports.load = exports.set = exports.get = void 0;
const fs = __importStar(require("fs"));
const Millis = __importStar(require("./Millis"));
let modified = false;
let vars = [];
let filename = null;
function get(name) {
    return process.env[name];
}
exports.get = get;
function set(name, value) {
    if (vars.includes(name))
        modified = true;
    process.env[name] = value;
}
exports.set = set;
function load(file) {
    filename = file;
    const filecontent = fs.readFileSync(file).toString();
    vars = [];
    filecontent.split('\n')
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
exports.load = load;
function save() {
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
exports.save = save;
function waitForVar(name, timeout = -1) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
            if (!!get(name)) {
                clearInterval(interval);
                resolve(get(name));
            }
            else if (timeout > 0 && counter > timeout) {
                reject(`Env.waitForVar - timed out waiting for environment var '${name}'`);
            }
            counter += 100;
        }, 100);
    });
}
exports.waitForVar = waitForVar;
class EnvBackedValue {
    constructor(key) {
        this.key = key;
    }
    get() {
        return get(this.key);
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
        if (!EnvBackedValue.saveTimeout) {
            EnvBackedValue.saveTimeout = setTimeout(() => {
                save();
                EnvBackedValue.saveTimeout = undefined;
            }, EnvBackedValue.timeout);
        }
    }
}
exports.EnvBackedValue = EnvBackedValue;
EnvBackedValue.timeout = Millis.fromSec(5);
