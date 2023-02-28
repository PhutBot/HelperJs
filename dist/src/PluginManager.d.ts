export interface IPluginDesc {
    name: string;
    package: string;
    isLocal: boolean;
    config?: any;
}
export declare abstract class AbstractPlugin {
    readonly dependencies: IPluginDependency[];
    abstract get name(): string;
    abstract get description(): string;
    abstract onLoad(config?: any): Promise<void>;
    abstract onUnload(): Promise<void>;
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
export declare class PluginManager<PluginType extends AbstractPlugin> {
    private config;
    private plugins;
    constructor(config?: PluginManagerConfig);
    getPlugins(): string[];
    getPlugin(name: string): PluginType;
    loadPlugin(pluginDesc: IPluginDesc): Promise<void>;
    unloadPlugin(name: string): Promise<void>;
    unloadAll(): Promise<void>;
}
