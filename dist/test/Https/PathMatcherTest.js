"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const TestCase_1 = require("../../src/Test/TestCase");
const decorators_1 = require("../../src/Test/decorators");
const PathMatcher_1 = require("../../src/Https/PathMatcher");
class PathMatcherTest extends TestCase_1.TestCase {
    match({ pattern, path, isWild, isDynamic, vars }) {
        const matcher = new PathMatcher_1.PathMatcher(pattern);
        const match = matcher.match(path);
        (0, assert_1.default)(match.isMatch === true);
        Object.entries(vars).forEach(([key, val]) => {
            (0, assert_1.default)(match.vars[key] === val, `\n\texpected: match.vars['${key}'] === '${val}'\n\tfound: '${match.vars[key]}'`);
        });
        (0, assert_1.default)(matcher.isWild === isWild);
        (0, assert_1.default)(matcher.isDynamic === isDynamic);
    }
    notMatch({ pattern, path, isWild, isDynamic }) {
        const matcher = new PathMatcher_1.PathMatcher(pattern);
        const match = matcher.match(path);
        (0, assert_1.default)(match.isMatch !== true);
        (0, assert_1.default)(matcher.isWild === isWild);
        (0, assert_1.default)(matcher.isDynamic === isDynamic);
    }
}
__decorate([
    (0, decorators_1.unroll)([
        { pattern: '/', path: '/', isWild: false, isDynamic: false, vars: {} },
        { pattern: '/*', path: '/', isWild: true, isDynamic: false, vars: { _: '' } },
        { pattern: '/*', path: '/a', isWild: true, isDynamic: false, vars: { _: 'a' } },
        { pattern: '/*', path: '/a/1', isWild: true, isDynamic: false, vars: { _: 'a/1' } },
        { pattern: '/a', path: '/a', isWild: false, isDynamic: false, vars: {} },
        { pattern: '/{v}', path: '/a', isWild: false, isDynamic: true, vars: { v: 'a' } },
        { pattern: '/a/*', path: '/a', isWild: true, isDynamic: false, vars: { _: '' } },
        { pattern: '/a/*', path: '/a/1', isWild: true, isDynamic: false, vars: { _: '1' } },
        { pattern: '/a/1', path: '/a/1', isWild: false, isDynamic: false, vars: {} },
        { pattern: '/a/{v}', path: '/a/1', isWild: false, isDynamic: true, vars: { v: '1' } },
        { pattern: '/a/{v}/*', path: '/a/b/c', isWild: true, isDynamic: true, vars: { v: 'b', _: 'c' } },
        { pattern: '/a', path: '/a?k=v', isWild: false, isDynamic: false, vars: {} },
    ])
], PathMatcherTest.prototype, "match", null);
__decorate([
    (0, decorators_1.unroll)([
        { pattern: '/', path: '/b', isWild: false, isDynamic: false, },
        { pattern: '/a', path: '/b', isWild: false, isDynamic: false, },
        { pattern: '/{v}', path: '/1/a', isWild: false, isDynamic: true, },
        { pattern: '/a/*', path: '/1/a', isWild: true, isDynamic: false, },
        { pattern: '/a/*', path: '/1/a', isWild: true, isDynamic: false, },
        { pattern: '/a/1', path: '/a/2', isWild: false, isDynamic: false, },
        { pattern: '/a/{v}', path: '/1/a', isWild: false, isDynamic: true, },
        { pattern: '/a/{v}/*', path: '/c/b/a', isWild: true, isDynamic: true, },
    ])
], PathMatcherTest.prototype, "notMatch", null);
exports.default = PathMatcherTest;
//# sourceMappingURL=PathMatcherTest.js.map