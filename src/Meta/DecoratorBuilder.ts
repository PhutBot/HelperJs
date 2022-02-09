import { defineMetadata, getMetadata, Metadata } from "./Metadata";

type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number, meta:Metadata) => void;
type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor, meta:Metadata) => PropertyDescriptor|void;
type PropertyDecorator = (target: any, propertyKey: string, meta:Metadata) => void;
type ClassDecorator = (constructor:Function, meta:Metadata) => any|void;

export class DecoratorBuilder {
    private name:string;
    private onParameterFunc?:ParameterDecorator;
    private onMethodFunc?:MethodDecorator;
    private onPropertyFunc?:PropertyDecorator;
    private onClassFunc?:ClassDecorator;

    constructor() {
        try { throw new Error(); }
        catch (err) {
            const allMatches = (err as Error)!.stack!.match(/(\w+)@|at (\w+) \(/g);
            // match parent function name
            const parentMatches = allMatches![0].match(/(\w+)@|at (\w+) \(/);
            // return only name
            this.name = `@${parentMatches![1] || parentMatches![2]}`;
        }
    }
    
    onParameter(func:ParameterDecorator) {
        this.onParameterFunc = func;
        return this;
    }
    
    onMethod(func:MethodDecorator) {
        this.onMethodFunc = func;
        return this;
    }
    
    onProperty(func:PropertyDecorator) {
        this.onPropertyFunc = func;
        return this;
    }
    
    onClass(func:ClassDecorator) {
        this.onClassFunc = func;
        return this;
    }

    build() {
        return (arg1:any, arg2?:any, arg3?:any) => {
            if (this.onClassFunc && !!arg1 && !arg2 && !arg3) {
                const og = arg1;
        
                const meta = this.addMeta(og, og.name);
                const target = this.onClassFunc(og, meta[this.name]);
                defineMetadata(target ?? og, meta);
                if (!!target)
                    return target;
            } else if (this.onPropertyFunc && !!arg1 && !!arg2 && !arg3) {
                throw new Error(`${this.name} decorator builder not implemented for properties`);
                // const target = arg1;
                // const propertyKey = arg2;
    
                // const meta = getMetadata(target) ?? {};
                // meta[this.name] = {};
                
                // this.onPropertyFunc(target, propertyKey, meta[this.name]);
                // defineMetadata(target, meta);
            } else if (this.onParameterFunc && !!arg1 && !!arg2 && typeof arg3 === 'number') {
                throw new Error(`${this.name} decorator builder not implemented for parameters`);
                // const target = arg1;
                // const propertyKey = arg2;
                // const index = arg3;
    
                // const meta = getMetadata(target) ?? {};
                // meta[this.name] = {};
    
                // this.onParameterFunc(target, propertyKey, index, meta[this.name]);
                // defineMetadata(target, meta);
            } else if (this.onMethodFunc && !!arg1 && !!arg2 && !!arg3) {
                const target = arg1;
                const propertyKey = arg2;
                const og = arg3;
    
                const meta = this.addMeta(og.value, propertyKey);
                const descriptor = this.onMethodFunc(target, propertyKey, og, meta[this.name]);
                defineMetadata(descriptor?.value ?? og.value, meta);
                if (!!descriptor)
                    return descriptor;
            } else {
                throw new Error(`${this.name} decorator not allowed here`);
            }
        };
    }

    private addMeta(target:any, name:string) {
        const meta = getMetadata(target) ?? {};
        meta[this.name] = { targetName: name };
        return meta;
    }
}