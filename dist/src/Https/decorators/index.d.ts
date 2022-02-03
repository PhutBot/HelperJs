import { RequestMethod } from "../Request";
interface RequestMapping {
    method?: RequestMethod | string;
    location?: string;
}
export declare function requestMapping(mapping: RequestMapping): (target: any, key?: string | undefined, desc?: TypedPropertyDescriptor<any> | undefined) => any;
export {};
