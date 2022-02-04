import assert from "assert";
import { TestCase } from "../../src/Test/TestCase";
import { test, unroll } from "../../src/Test/decorators";
import { PathMatcher } from "../../src/Https/PathMatcher";

export default class PathMatcherTest extends TestCase {

    @unroll([
        { pattern: '/',        path: '/',      isWild: false, isDynamic: false, vars: {}                 },
        { pattern: '/*',       path: '/',      isWild: true,  isDynamic: false, vars: { _: '' }          },
        { pattern: '/*',       path: '/a',     isWild: true,  isDynamic: false, vars: { _: 'a' }         },
        { pattern: '/*',       path: '/a/1',   isWild: true,  isDynamic: false, vars: { _: 'a/1' }       },
        { pattern: '/a',       path: '/a',     isWild: false, isDynamic: false, vars: {}                 },
        { pattern: '/{v}',     path: '/a',     isWild: false, isDynamic: true,  vars: { v: 'a' }         },
        { pattern: '/a/*',     path: '/a',     isWild: true,  isDynamic: false, vars: { _: '' }          },
        { pattern: '/a/*',     path: '/a/1',   isWild: true,  isDynamic: false, vars: { _: '1' }         },
        { pattern: '/a/1',     path: '/a/1',   isWild: false, isDynamic: false, vars: {}                 },
        { pattern: '/a/{v}',   path: '/a/1',   isWild: false, isDynamic: true,  vars: { v: '1' }         },
        { pattern: '/a/{v}/*', path: '/a/b/c', isWild: true,  isDynamic: true,  vars: { v: 'b', _: 'c' } },
        { pattern: '/a',       path: '/a?k=v', isWild: false, isDynamic: false, vars: {}                 },
    ])
    match({ pattern, path, isWild, isDynamic, vars }:any) {
        const matcher = new PathMatcher(pattern);
        const match = matcher.match(path);

        assert(match.isMatch === true);
        Object.entries(vars).forEach(([key,val]) => {
            assert(match.vars[key] === val, `\n\texpected: match.vars['${key}'] === '${val}'\n\tfound: '${match.vars[key]}'`);
        });
        assert(matcher.isWild === isWild);
        assert(matcher.isDynamic === isDynamic);
    }

    @unroll([
        { pattern: '/',        path: '/b',     isWild: false, isDynamic: false, },
        { pattern: '/a',       path: '/b',     isWild: false, isDynamic: false, },
        { pattern: '/{v}',     path: '/1/a',   isWild: false, isDynamic: true,  },
        { pattern: '/a/*',     path: '/1/a',   isWild: true,  isDynamic: false, },
        { pattern: '/a/*',     path: '/1/a',   isWild: true,  isDynamic: false, },
        { pattern: '/a/1',     path: '/a/2',   isWild: false, isDynamic: false, },
        { pattern: '/a/{v}',   path: '/1/a',   isWild: false, isDynamic: true,  },
        { pattern: '/a/{v}/*', path: '/c/b/a', isWild: true,  isDynamic: true,  },
    ])
    notMatch({ pattern, path, isWild, isDynamic }:any) {
        const matcher = new PathMatcher(pattern);
        const match = matcher.match(path);

        assert(match.isMatch !== true);
        assert(matcher.isWild === isWild);
        assert(matcher.isDynamic === isDynamic);
    }
}
