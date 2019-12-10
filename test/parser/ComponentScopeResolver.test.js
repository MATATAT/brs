const brs = require("brs");
const { getComponentDefinitionMap } = require("../../lib/componentprocessor");
const path = require("path");

jest.mock("fast-glob");
jest.mock("fs");
const fg = require("fast-glob");
const fs = require("fs");

const realFs = jest.requireActual("fs");

describe("ComponentScopeResolver", () => {
    beforeEach(() => {
        fg.sync.mockImplementation(() => {
            return [
                "baseComponent.xml",
                "extendedComponent.xml",
                "scripts/baseComponent.brs",
                "scripts/extendedComponenet.brs",
            ];
        });
        fs.readFile.mockImplementation((filename, _, cb) => {
            resourcePath = path.join(__dirname, "resources", filename);
            realFs.readFile(resourcePath, (err, contents) => {
                cb(/* no error */ null, contents);
            });
        });
    });

    test("resolving function scope across two components", async () => {
        let componentMap = await getComponentDefinitionMap("/doesnt/matter");
        let componentToResolve = componentMap.get("ExtendedComponent");
        let componentScopeResolver = new brs.parser.ComponentScopeResolver();
        let statements = componentScopeResolver.resolve(componentToResolve, componentMap);
        expect(statements.length).toBeGreaterThan(0);
    });
});
