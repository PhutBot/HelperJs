import { AbstractPlugin } from "../../src/PluginManager";

export class Plugin extends AbstractPlugin {
    public get name() { return "TestPlugin"; }
    public get description() { return "First Test Plugin"; }
    public async onLoad() {}
    public async onUnload() {}
}