import { Metadata } from "./Metadata.js";
type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number, meta: Metadata) => void;
type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor, meta: Metadata) => undefined | PropertyDescriptor;
type PropertyDecorator = (target: any, propertyKey: string, meta: Metadata) => void;
type ClassDecorator = (constructor: Function, meta: Metadata) => any | void;
export declare class DecoratorBuilder {
    private name;
    private onParameterFunc?;
    private onMethodFunc?;
    private onPropertyFunc?;
    private onClassFunc?;
    constructor();
    onParameter(func: ParameterDecorator): this;
    onMethod(func: MethodDecorator): this;
    onProperty(func: PropertyDecorator): this;
    onClass(func: ClassDecorator): this;
    build(): (arg1: any, arg2?: any, arg3?: any) => any;
    private addMeta;
}
export {};
//# sourceMappingURL=DecoratorBuilder.d.ts.map