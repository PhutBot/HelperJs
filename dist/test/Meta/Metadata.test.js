var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as assert from 'assert';
import { TestCase } from "../../src/Test/TestCase.js";
import { Unroll } from "../../src/Test/decorators/index.js";
import { defineMetadata, getMetadata } from "../../src/Meta/Metadata.js";
class PlaceHolder {
}
export default class MetadataTest extends TestCase {
    typeMetadata({ target, key, val }) {
        defineMetadata(target, key, val);
        assert.strictEqual(getMetadata(target, key), val);
        assert.strictEqual(!!target[key], false);
        assert.strictEqual(!!target.__meta, false);
    }
    instanceMetadata({ target, key, val }) {
        defineMetadata(target, key, val);
        assert.strictEqual(getMetadata(target, key), val);
        assert.strictEqual(!!target[key], false);
        assert.strictEqual(Object.keys(target).includes('__meta'), false);
    }
}
__decorate([
    Unroll([
        { target: PlaceHolder, key: 'class', val: true },
    ])
], MetadataTest.prototype, "typeMetadata", null);
__decorate([
    Unroll([
        { target: {}, key: 'object', val: true },
        { target: () => { }, key: 'function', val: true },
        { target: new PlaceHolder(), key: 'class', val: true },
    ])
], MetadataTest.prototype, "instanceMetadata", null);
//# sourceMappingURL=Metadata.test.js.map