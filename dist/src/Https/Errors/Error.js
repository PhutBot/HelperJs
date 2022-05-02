"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHttp = void 0;
class ErrorHttp extends Error {
    constructor(request, statusCode, description, msg) {
        super(msg !== null && msg !== void 0 ? msg : description);
        this.description = description;
        this.statusCode = statusCode;
        this.request = request;
    }
}
exports.ErrorHttp = ErrorHttp;
//# sourceMappingURL=Error.js.map