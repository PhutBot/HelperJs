import { AbstractPlugin } from "../../../src/PluginManager.js";
export declare class Plugin extends AbstractPlugin {
    get name(): string;
    get description(): string;
    onLoad(): Promise<void>;
    onUnload(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map