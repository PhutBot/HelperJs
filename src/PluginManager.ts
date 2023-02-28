import { existsSync } from "fs";

export interface IPluginDesc {
    name: string;
    package: string;
    isLocal: boolean;
    config?: any;
}

export abstract class AbstractPlugin {
    public readonly dependencies: IPluginDependency[] = [];

    public abstract get name(): string;
    public abstract get description(): string;

    public abstract onLoad(config?: any): Promise<void>;
    public abstract onUnload(): Promise<void>;
}

export interface IPluginDependency {
    pluginName: string;
    instanceName?: string;
    instance?: AbstractPlugin;
}

export interface PluginManagerConfig {
    localDir?: string;
    moduleDir?: string;
}

export class PluginManager<PluginType extends AbstractPlugin> {
    private config: PluginManagerConfig = {
        localDir: './plugins',
        moduleDir: '../node_modules',
    };
    private plugins: Record<string, PluginType> = {};

    public constructor(config?: PluginManagerConfig) {
        this.config = Object.assign(this.config, config);
    }

    public getPlugins() {
        return Object.keys(this.plugins);
    }

    public getPlugin(name: string) {
        return this.plugins[name];
    }

    public async loadPlugin(pluginDesc: IPluginDesc) {
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
            const module = await import(location);
            const instance = new module.Plugin() as PluginType;
            
            instance.dependencies.forEach(dependency => {
                const dep = Object.entries(this.plugins)
                    .find(([key, plugin]) => {
                        return plugin.name === dependency.pluginName
                            && (!dependency.instanceName || dependency.instanceName === key)
                    })?.at(1);
                if (!dep)
                    throw Error(`Could not find dependency with name '${dependency.pluginName}${dependency.instance ? `-${dependency.instance}` : ''}'`);
                dependency.instance = dep as AbstractPlugin;
            });

            await instance.onLoad(pluginDesc.config);
            this.plugins[pluginDesc.name] = instance;
        } catch (err) {
            throw err;
        }
    }

    public async unloadPlugin(name: string) {
        if (!this.plugins[name])
            throw new Error(`Cannot find plugin with name '${name}'`);
        
        await this.plugins[name].onUnload();
        delete this.plugins[name];
    }

    public async unloadAll() {
        await Promise.allSettled(Object.keys(this.plugins).map(
            this.unloadPlugin.bind(this)));
    }
}