"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.PageNotFoundError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(statusCode, description, msg) {
        super(msg !== null && msg !== void 0 ? msg : description);
        this.description = description;
        this.statusCode = statusCode;
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(request, msg) {
        super(400, 'bad request', msg);
        this.request = request;
    }
}
exports.BadRequestError = BadRequestError;
class PageNotFoundError extends HttpError {
    constructor(url, msg) {
        super(404, `page not found (${url.pathname})`, msg);
        this.url = url;
    }
}
exports.PageNotFoundError = PageNotFoundError;
class InternalServerError extends HttpError {
    constructor(msg) {
        super(500, 'internal server error', msg);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=Error.js.map