export class TestCase {

    async setup() {}
    async teardown() {}
    async before(testcase:string):Promise<any> {}
    async after(testcase:string, ctx:any) {}
}