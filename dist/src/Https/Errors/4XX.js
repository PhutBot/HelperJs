"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHttp418Teapot = exports.ErrorHttp409Conflict = exports.ErrorHttp405Method = exports.ErrorHttp404NotFound = exports.ErrorHttp403Forbidden = exports.ErrorHttp401Unauthorized = exports.ErrorHttp400BadRequest = void 0;
const Error_1 = require("./Error");
class ErrorHttp400BadRequest extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 400, 'Bad request', msg);
    }
}
exports.ErrorHttp400BadRequest = ErrorHttp400BadRequest;
class ErrorHttp401Unauthorized extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 401, 'Unauthorized', msg);
    }
}
exports.ErrorHttp401Unauthorized = ErrorHttp401Unauthorized;
class ErrorHttp403Forbidden extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 403, 'Forbidden', msg);
    }
}
exports.ErrorHttp403Forbidden = ErrorHttp403Forbidden;
class ErrorHttp404NotFound extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 404, `Page not found (${request.url.pathname})`, msg);
    }
}
exports.ErrorHttp404NotFound = ErrorHttp404NotFound;
class ErrorHttp405Method extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 405, 'Method not allowed', msg);
    }
}
exports.ErrorHttp405Method = ErrorHttp405Method;
class ErrorHttp409Conflict extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 409, 'Conflicting request', msg);
    }
}
exports.ErrorHttp409Conflict = ErrorHttp409Conflict;
class ErrorHttp418Teapot extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 418, "I'm a teapot", msg);
    }
}
exports.ErrorHttp418Teapot = ErrorHttp418Teapot;
//# sourceMappingURL=4XX.js.map