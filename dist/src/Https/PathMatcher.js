"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathMatcher = void 0;
class PathMatcher {
    constructor(path) {
        this.path = PathMatcher.prepPath(path);
        this.regex = new RegExp(prepPattern(path), 'g');
        this.isWild = this.path.endsWith('*');
        this.isDynamic = this.path.includes('{') && this.path.includes('}'); // this may need to be a counter
    }
    match(path) {
        this.regex.lastIndex = 0;
        path = PathMatcher.prepPath(path);
        if (this.path === path) {
            return {
                isMatch: true,
                vars: {}
            };
        }
        if (this.regex.test(path)) {
            this.regex.lastIndex = 0;
            const vars = {};
            const matches = path.matchAll(this.regex);
            let match = matches.next();
            while (!match.done) {
                if (!!match.value.groups) {
                    Object.assign(vars, match.value.groups);
                }
                match = matches.next();
            }
            return {
                isMatch: true,
                vars
            };
        }
        return {
            isMatch: false,
            vars: {}
        };
    }
    static prepPath(path) {
        return fixSlashes(path).replace(/\{([_a-zA-Z][_a-zA-Z0-9]*)\}/g, '{}');
    }
}
exports.PathMatcher = PathMatcher;
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
function fixCaptureGroups(text) {
    return text
        .replace(/\/\\\*/g, '/?(?<_>.*)$')
        .replace(/\\\{([_a-zA-Z][_a-zA-Z0-9]*)\\\}/g, '(?<$1>[^/]+)');
}
function prepPattern(text) {
    return `^${fixCaptureGroups(escapeRegex(fixSlashes(text)))}$`;
}
function fixSlashes(path) {
    return `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}
//# sourceMappingURL=PathMatcher.js.map