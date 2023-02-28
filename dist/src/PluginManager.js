var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { existsSync } from 'fs';
export class AbstractPlugin {
    constructor() {
        this.dependencies = [];
    }
}
export class PluginManager {
    constructor(config) {
        this.config = {
            localDir: './plugins',
            moduleDir: '../node_modules',
        };
        this.plugins = {};
        this.config = Object.assign(this.config, config);
    }
    getPlugins() {
        return Object.keys(this.plugins);
    }
    getPlugin(name) {
        return this.plugins[name];
    }
    loadPlugin(pluginDesc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginDesc.name || !pluginDesc.package)
                throw new Error('Plugin name and package are required');
            if (this.plugins[pluginDesc.name])
                throw new Error(`Cannot add existing plugin ${pluginDesc.name}`);
            const location = pluginDesc.isLocal
                ? `${this.config.localDir}/${pluginDesc.package}/index.js`
                : `${this.config.moduleDir}/${pluginDesc.package}`;
            if (!existsSync(location)) {
                throw new Error(`Could not find plugin ${pluginDesc.name} at ${location}`);
            }
            try {
                const module = yield import(location);
                const instance = new module.Plugin();
                instance.dependencies.forEach(dependency => {
                    var _a;
                    const dep = (_a = Object.entries(this.plugins)
                        .find(([key, plugin]) => {
                        return plugin.name === dependency.pluginName
                            && (!dependency.instanceName || dependency.instanceName === key);
                    })) === null || _a === void 0 ? void 0 : _a.at(1);
                    if (!dep)
                        throw Error(`Could not find dependency with name '${dependency.pluginName}${dependency.instance ? `-${dependency.instance}` : ''}'`);
                    dependency.instance = dep;
                });
                yield instance.onLoad(pluginDesc.config);
                this.plugins[pluginDesc.name] = instance;
            }
            catch (err) {
                throw err;
            }
        });
    }
    unloadPlugin(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.plugins[name])
                throw new Error(`Cannot find plugin with name '${name}'`);
            yield this.plugins[name].onUnload();
            delete this.plugins[name];
        });
    }
    unloadAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.allSettled(Object.keys(this.plugins).map(this.unloadPlugin.bind(this)));
        });
    }
}
//# sourceMappingURL=PluginManager.js.map