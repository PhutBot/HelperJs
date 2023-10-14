import { RequestMethod } from "../Request.js";
interface RequestMapping {
    method?: RequestMethod | string;
    location?: string;
}
export declare function RequestMapping(mapping: RequestMapping): (arg1: any, arg2?: any, arg3?: any) => any;
export declare function Controller<T>(path?: string): (arg1: any, arg2?: any, arg3?: any) => any;
export declare function Get(path?: string): (arg1: any, arg2?: any, arg3?: any) => any;
export declare function Put(path?: string): (arg1: any, arg2?: any, arg3?: any) => any;
export declare function Post(path?: string): (arg1: any, arg2?: any, arg3?: any) => any;
export declare function Delete(path?: string): (arg1: any, arg2?: any, arg3?: any) => any;
export {};
//# sourceMappingURL=index.d.ts.map