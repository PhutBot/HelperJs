import * as assert from 'assert';
import { Test, Unroll } from "../../src/Test/decorators/index.js";
import { TestCase } from "../../src/Test/TestCase.js";
import { PluginManager } from "../../src/PluginManager.js";

const localDir = '/home/node/app/dist/test/PluginManager';
export default class PluginManagerTest extends TestCase {
    @Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
    })
    async loadPlugin(testCase:any) {
        const manager = new PluginManager({ localDir });
        assert.equal(manager.getPlugins().length, 0);
        
        try {
            await manager.loadPlugin(testCase.plugin);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
        } catch(err: any) {
            assert.fail(err);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
    }

    @Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
    })
    async unloadPlugin(testCase:any) {
        const manager = new PluginManager({ localDir });
        assert.equal(manager.getPlugins().length, 0);
        
        try {
            await manager.loadPlugin(testCase.plugin);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
            assert.equal(manager.getPlugins().length, 1);

            await manager.unloadPlugin(testCase.plugin.name);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), false);
            assert.equal(manager.getPlugins().length, 0);

            await manager.loadPlugin(testCase.plugin);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
            assert.equal(manager.getPlugins().length, 1);
        } catch(err: any) {
            assert.fail(err);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
    }

    @Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
        expectedError: "Could not find plugin"
    })
    async pluginNotFound(testCase:any) {
        const manager = new PluginManager();
        assert.equal(manager.getPlugins().length, 0);
        
        let errs = 0;
        try {
            await manager.loadPlugin(testCase.plugin);
        } catch(err: any) {
            errs += 1;
            assert.equal((err as Error).message.substring(0, testCase.expectedError.length), testCase.expectedError);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
        assert.equal(errs, 1);
    }

    @Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
        expectedError: "Cannot add existing plugin"
    })
    async duplicatePluginSameName(testCase:any) {
        const manager = new PluginManager({ localDir });
        assert.equal(manager.getPlugins().length, 0);
        
        let errs = 0;
        try {
            await manager.loadPlugin(testCase.plugin);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
            await manager.loadPlugin(testCase.plugin);
        } catch(err: any) {
            errs += 1;
            assert.equal((err as Error).message.substring(0, testCase.expectedError.length), testCase.expectedError);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
        assert.equal(errs, 1);
    }

    @Unroll([
        { plugin: {name: "TestPluginWithDeps", package: "TestPluginWithDeps", isLocal: true},
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true } },
        { plugin: {name: "TestPluginWithNamedDeps", package: "TestPluginWithNamedDeps", isLocal: true},
            dependency:{ name: "TestPlugin", package: "TestPlugin", isLocal: true, instanceName: "TestPlugin" } },
    ])
    async pluginWithDependencies(testCase: any) {
        const manager = new PluginManager({ localDir });
        assert.equal(manager.getPlugins().length, 0);
        
        try {
            await manager.loadPlugin(testCase.dependency);
            assert.equal(!!manager.getPlugin(testCase.dependency.name), true);
            await manager.loadPlugin(testCase.plugin);
            assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
            assert.equal(manager.getPlugin(testCase.plugin.name).dependencies[0].instance!.name, testCase.dependency.name);
        } catch(err: any) {
            assert.fail(err);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
    }

    @Unroll([
        { plugin: {name: "TestPluginWithDeps", package: "TestPluginWithDeps", isLocal: true},
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true },
            expectedError: "Could not find dependency with name" },
        { plugin: {name: "TestPluginWithNamedDeps", package: "TestPluginWithNamedDeps", isLocal: true},
            dependency:{ name: "TestPlugin", package: "TestPlugin", isLocal: true, instanceName: "TestPlugin" },
            expectedError: "Could not find dependency with name" },
    ])
    async pluginWithMissingDependencies(testCase: any) {
        const manager = new PluginManager({ localDir });
        assert.equal(manager.getPlugins().length, 0);
        
        let errs = 0;
        try {
            await manager.loadPlugin(testCase.plugin);
        } catch(err: any) {
            errs += 1;
            assert.equal(err.message.substring(0, testCase.expectedError.length), testCase.expectedError);
        } finally {
            await manager.unloadAll();
            assert.equal(manager.getPlugins().length, 0);
        }
        assert.equal(errs, 1);
    }
}
