"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const PluginManager_1 = require("../../src/PluginManager");
class Plugin extends PluginManager_1.AbstractPlugin {
    constructor() {
        super();
        this.dependencies.push({ pluginName: "TestPlugin" });
    }
    get name() { return "TestPluginWithDeps"; }
    get description() { return "Second Test Plugin"; }
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    onUnload() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=TestPluginWithDeps.js.map