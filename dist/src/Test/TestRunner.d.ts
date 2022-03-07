export declare enum TestResult {
    PASS = "PASS",
    FAIL = "FAIL",
    ERROR = "ERROR",
    _TOTAL = "TOTAL"
}
export declare function RunTests(dir: string): Promise<void>;
