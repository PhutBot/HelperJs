"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const TestCase_1 = require("../../src/Test/TestCase");
const decorators_1 = require("../../src/Test/decorators");
const Metadata_1 = require("../../src/Meta/Metadata");
class PlaceHolder {
}
class MetadataTest extends TestCase_1.TestCase {
    typeMetadata({ target, key, val }) {
        (0, Metadata_1.defineMetadata)(target, key, val);
        assert_1.default.strictEqual((0, Metadata_1.getMetadata)(target, key), val);
        assert_1.default.strictEqual(!!target[key], false);
        assert_1.default.strictEqual(!!target.__meta, false);
    }
    instanceMetadata({ target, key, val }) {
        (0, Metadata_1.defineMetadata)(target, key, val);
        assert_1.default.strictEqual((0, Metadata_1.getMetadata)(target, key), val);
        assert_1.default.strictEqual(!!target[key], false);
        assert_1.default.strictEqual(Object.keys(target).includes('__meta'), false);
    }
}
__decorate([
    (0, decorators_1.Unroll)([
        { target: PlaceHolder, key: 'class', val: true },
    ])
], MetadataTest.prototype, "typeMetadata", null);
__decorate([
    (0, decorators_1.Unroll)([
        { target: {}, key: 'object', val: true },
        { target: () => { }, key: 'function', val: true },
        { target: new PlaceHolder(), key: 'class', val: true },
    ])
], MetadataTest.prototype, "instanceMetadata", null);
exports.default = MetadataTest;
//# sourceMappingURL=Metadata.test.js.map