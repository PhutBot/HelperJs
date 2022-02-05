import { RequestMethod } from "../Request";
interface RequestMapping {
    method?: RequestMethod | string;
    location?: string;
}
export declare function RequestMapping(mapping: RequestMapping): (arg1: any, arg2?: any, arg3?: any) => any;
export {};
