import { Metadata } from "./Metadata";
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number, meta: Metadata) => void;
declare type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor, meta: Metadata) => PropertyDescriptor | void;
declare type PropertyDecorator = (target: any, propertyKey: string, meta: Metadata) => void;
declare type ClassDecorator = (constructor: Function, meta: Metadata) => any | void;
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
