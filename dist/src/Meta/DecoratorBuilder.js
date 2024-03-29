import { defineMetadata, getMetadata } from "./Metadata.js";
export class DecoratorBuilder {
    constructor() {
        try {
            throw new Error();
        }
        catch (err) {
            const allMatches = err.stack.match(/(\w+)@|at (\w+) \(/g);
            // match parent function name
            const parentMatches = allMatches[0].match(/(\w+)@|at (\w+) \(/);
            // return only name
            this.name = `@${parentMatches[1] || parentMatches[2]}`;
        }
    }
    onParameter(func) {
        this.onParameterFunc = func;
        return this;
    }
    onMethod(func) {
        this.onMethodFunc = func;
        return this;
    }
    onProperty(func) {
        this.onPropertyFunc = func;
        return this;
    }
    onClass(func) {
        this.onClassFunc = func;
        return this;
    }
    build() {
        return (arg1, arg2, arg3) => {
            var _a;
            if (this.onClassFunc && !!arg1 && !arg2 && !arg3) {
                const og = arg1;
                const meta = this.addMeta(og, og.name);
                const target = this.onClassFunc(og, meta[this.name]);
                defineMetadata(target !== null && target !== void 0 ? target : og, meta);
                if (!!target)
                    return target;
            }
            else if (this.onPropertyFunc && !!arg1 && !!arg2 && !arg3) {
                throw new Error(`${this.name} decorator builder not implemented for properties`);
                // const target = arg1;
                // const propertyKey = arg2;
                // const meta = getMetadata(target) ?? {};
                // meta[this.name] = {};
                // this.onPropertyFunc(target, propertyKey, meta[this.name]);
                // defineMetadata(target, meta);
            }
            else if (this.onParameterFunc && !!arg1 && !!arg2 && typeof arg3 === 'number') {
                throw new Error(`${this.name} decorator builder not implemented for parameters`);
                // const target = arg1;
                // const propertyKey = arg2;
                // const index = arg3;
                // const meta = getMetadata(target) ?? {};
                // meta[this.name] = {};
                // this.onParameterFunc(target, propertyKey, index, meta[this.name]);
                // defineMetadata(target, meta);
            }
            else if (this.onMethodFunc && !!arg1 && !!arg2 && !!arg3) {
                const target = arg1;
                const propertyKey = arg2;
                const og = arg3;
                const meta = this.addMeta(og.value, propertyKey);
                const descriptor = this.onMethodFunc(target, propertyKey, og, meta[this.name]);
                defineMetadata((_a = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) !== null && _a !== void 0 ? _a : og.value, meta);
                if (!!descriptor)
                    return descriptor;
            }
            else {
                throw new Error(`${this.name} decorator not allowed here`);
            }
        };
    }
    addMeta(target, name) {
        var _a;
        const meta = (_a = getMetadata(target)) !== null && _a !== void 0 ? _a : {};
        meta[this.name] = { targetName: name };
        return meta;
    }
}
//# sourceMappingURL=DecoratorBuilder.js.map