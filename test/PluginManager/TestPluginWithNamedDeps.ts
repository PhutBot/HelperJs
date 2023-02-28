import { AbstractPlugin } from "../../src/PluginManager";

export class Plugin extends AbstractPlugin {
    constructor() {
        super();
        this.dependencies.push({ pluginName: "TestPlugin", instanceName: "TestPlugin" });
    }

    public get name() { return "TestPluginWithDeps"; }
    public get description() { return "Second Test Plugin"; }
    public async onLoad() {}
    public async onUnload() {}
}