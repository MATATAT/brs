const brs = require("brs");
const path = require("path");
const { getComponentDefinitionMap } = require("../../lib/componentprocessor");
const { defaultExecutionOptions } = require("../../lib/interpreter");
const LexerParser = require("../../lib/LexerParser");

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
            realFs.readFile(resourcePath, "utf8", (err, contents) => {
                cb(/* no error */ null, contents);
            });
        });
    });

    afterEach(() => {
        fg.sync.mockRestore();
        fs.readFile.mockRestore();
    });

    test("resolving function scope across two components", async () => {
        let parseFn = LexerParser.getLexerParserFn(new Map(), defaultExecutionOptions);

        let componentMap = await getComponentDefinitionMap("/doesnt/matter");
        componentMap.forEach(comp => {
            comp.scripts = comp.scripts.map(script => {
                script.uri = path.join("scripts/", path.parse(script.uri).base);
                return script;
            });
        });

        let componentToResolve = componentMap.get("ExtendedComponent");
        let componentScopeResolver = new brs.parser.ComponentScopeResolver(componentMap, parseFn);
        let statements = await componentScopeResolver.resolve(componentToResolve);
        expect(statements).toBeDefined();
        expect(statements.length).toBe(2);

        let statementNames = statements.map(s => s.name.text);
        expect(statementNames).toEqual(["test", "test2"]);

        let testStatement = statements.find(s => s.name.text === "test");
        let testStatementCount = testStatement.func.body.statements.length;
        expect(testStatementCount).toEqual(2);
    });
});
