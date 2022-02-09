import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { Unroll } from "../../src/Test/decorators";
import { defineMetadata, getMetadata } from "../../src/Meta/Metadata";

class PlaceHolder {}
export default class MetadataTest extends TestCase {

    @Unroll([
        { target: PlaceHolder, key: 'class', val: true },
    ])
    typeMetadata({ target, key, val }:any) {
        defineMetadata(target, key, val);
        assert.strictEqual(getMetadata(target, key), val);
        assert.strictEqual(!!target[key], false);
        assert.strictEqual(!!target.__meta, false);
    }

    @Unroll([
        { target: {}, key: 'object', val: true },
        { target: () => {}, key: 'function', val: true },
        { target: new PlaceHolder(), key: 'class', val: true },
    ])
    instanceMetadata({ target, key, val }:any) {
        defineMetadata(target, key, val);
        assert.strictEqual(getMetadata(target, key), val);
        assert.strictEqual(!!target[key], false);
    }
}
