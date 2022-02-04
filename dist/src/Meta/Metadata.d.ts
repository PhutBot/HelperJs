export declare type Metadata = Record<string, any>;
export declare function defineMetadata(target: any, key: string | Metadata, value?: object): void;
export declare function getMetadata(target: any, key?: string): any;
