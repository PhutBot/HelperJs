import { TestCase } from "../../src/Test/TestCase.js";
export default class PluginManagerTest extends TestCase {
    loadPlugin(testCase: any): Promise<void>;
    unloadPlugin(testCase: any): Promise<void>;
    pluginNotFound(testCase: any): Promise<void>;
    duplicatePluginSameName(testCase: any): Promise<void>;
    pluginWithDependencies(testCase: any): Promise<void>;
    pluginWithMissingDependencies(testCase: any): Promise<void>;
}
//# sourceMappingURL=PluginManager.test.d.ts.map