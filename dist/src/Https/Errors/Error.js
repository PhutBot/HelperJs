export class ErrorHttp extends Error {
    constructor(request, statusCode, description, msg) {
        super(msg !== null && msg !== void 0 ? msg : description);
        this.description = description;
        this.statusCode = statusCode;
        this.request = request;
    }
}
//# sourceMappingURL=Error.js.map