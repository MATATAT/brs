const brs = require("brs");

describe("ComponentScopeResolver", () => {
    it("is a test", () => {
        let componentScopeResolver = new brs.parser.ComponentScopeResolver();
        expect(componentScopeResolver).not.toBeUndefined();
    });
});
