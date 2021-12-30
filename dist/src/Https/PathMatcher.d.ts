export declare class PathMatcher {
    readonly path: string;
    readonly isWild: boolean;
    readonly isDynamic: boolean;
    private regex;
    constructor(path: string);
    match(path: string): {
        isMatch: boolean;
        vars: {};
    };
}
