import { ErrorHttp } from "./Error.js";
export class ErrorHttp500Internal extends ErrorHttp {
    constructor(request, msg) {
        super(request, 500, 'Internal server error', msg);
    }
}
//# sourceMappingURL=5XX.js.map