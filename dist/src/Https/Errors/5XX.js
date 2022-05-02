"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHttp500Internal = void 0;
const Error_1 = require("./Error");
class ErrorHttp500Internal extends Error_1.ErrorHttp {
    constructor(request, msg) {
        super(request, 500, 'Internal server error', msg);
    }
}
exports.ErrorHttp500Internal = ErrorHttp500Internal;
//# sourceMappingURL=5XX.js.map