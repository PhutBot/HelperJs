var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as assert from 'assert';
import { Test, Unroll } from "../../src/Test/decorators/index.js";
import { TestCase } from "../../src/Test/TestCase.js";
import { PluginManager } from "../../src/PluginManager.js";
const localDir = '/home/node/app/dist/test/PluginManager';
export default class PluginManagerTest extends TestCase {
    loadPlugin(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager({ localDir });
            assert.equal(manager.getPlugins().length, 0);
            try {
                yield manager.loadPlugin(testCase.plugin);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
            }
            catch (err) {
                assert.fail(err);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
        });
    }
    unloadPlugin(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager({ localDir });
            assert.equal(manager.getPlugins().length, 0);
            try {
                yield manager.loadPlugin(testCase.plugin);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
                assert.equal(manager.getPlugins().length, 1);
                yield manager.unloadPlugin(testCase.plugin.name);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), false);
                assert.equal(manager.getPlugins().length, 0);
                yield manager.loadPlugin(testCase.plugin);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
                assert.equal(manager.getPlugins().length, 1);
            }
            catch (err) {
                assert.fail(err);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
        });
    }
    pluginNotFound(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager();
            assert.equal(manager.getPlugins().length, 0);
            let errs = 0;
            try {
                yield manager.loadPlugin(testCase.plugin);
            }
            catch (err) {
                errs += 1;
                assert.equal(err.message.substring(0, testCase.expectedError.length), testCase.expectedError);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
            assert.equal(errs, 1);
        });
    }
    duplicatePluginSameName(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager({ localDir });
            assert.equal(manager.getPlugins().length, 0);
            let errs = 0;
            try {
                yield manager.loadPlugin(testCase.plugin);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
                yield manager.loadPlugin(testCase.plugin);
            }
            catch (err) {
                errs += 1;
                assert.equal(err.message.substring(0, testCase.expectedError.length), testCase.expectedError);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
            assert.equal(errs, 1);
        });
    }
    pluginWithDependencies(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager({ localDir });
            assert.equal(manager.getPlugins().length, 0);
            try {
                yield manager.loadPlugin(testCase.dependency);
                assert.equal(!!manager.getPlugin(testCase.dependency.name), true);
                yield manager.loadPlugin(testCase.plugin);
                assert.equal(!!manager.getPlugin(testCase.plugin.name), true);
                assert.equal(manager.getPlugin(testCase.plugin.name).dependencies[0].instance.name, testCase.dependency.name);
            }
            catch (err) {
                assert.fail(err);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
        });
    }
    pluginWithMissingDependencies(testCase) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new PluginManager({ localDir });
            assert.equal(manager.getPlugins().length, 0);
            let errs = 0;
            try {
                yield manager.loadPlugin(testCase.plugin);
            }
            catch (err) {
                errs += 1;
                assert.equal(err.message.substring(0, testCase.expectedError.length), testCase.expectedError);
            }
            finally {
                yield manager.unloadAll();
                assert.equal(manager.getPlugins().length, 0);
            }
            assert.equal(errs, 1);
        });
    }
}
__decorate([
    Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
    })
], PluginManagerTest.prototype, "loadPlugin", null);
__decorate([
    Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
    })
], PluginManagerTest.prototype, "unloadPlugin", null);
__decorate([
    Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
        expectedError: "Could not find plugin"
    })
], PluginManagerTest.prototype, "pluginNotFound", null);
__decorate([
    Test({
        plugin: { name: "Test", package: "TestPlugin", isLocal: true },
        expectedError: "Cannot add existing plugin"
    })
], PluginManagerTest.prototype, "duplicatePluginSameName", null);
__decorate([
    Unroll([
        { plugin: { name: "TestPluginWithDeps", package: "TestPluginWithDeps", isLocal: true },
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true } },
        { plugin: { name: "TestPluginWithNamedDeps", package: "TestPluginWithNamedDeps", isLocal: true },
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true, instanceName: "TestPlugin" } },
    ])
], PluginManagerTest.prototype, "pluginWithDependencies", null);
__decorate([
    Unroll([
        { plugin: { name: "TestPluginWithDeps", package: "TestPluginWithDeps", isLocal: true },
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true },
            expectedError: "Could not find dependency with name" },
        { plugin: { name: "TestPluginWithNamedDeps", package: "TestPluginWithNamedDeps", isLocal: true },
            dependency: { name: "TestPlugin", package: "TestPlugin", isLocal: true, instanceName: "TestPlugin" },
            expectedError: "Could not find dependency with name" },
    ])
], PluginManagerTest.prototype, "pluginWithMissingDependencies", null);
//# sourceMappingURL=PluginManager.test.js.map