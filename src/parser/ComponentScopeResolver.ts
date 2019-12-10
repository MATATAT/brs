import { ComponentDefinition } from "../componentprocessor";
import * as Stmt from "./Statement";

export class ComponentScopeResolver {
    /**
     * @param componentMap Component definition map to reference for function resolution.
     * @param parserLexerFn Function used to parse statements out of given components
     */
    constructor(
        readonly componentMap: Map<string, ComponentDefinition>,
        readonly parserLexerFn: (filenames: string[]) => Promise<Stmt.Statement[]> // TODO: Remove and just build here?
    ) {}

    /**
     * Resolves the component functions in scope based on the extends hierarchy.
     * @param component Instance of the component to resolve function scope for.
     * @returns All statements in scope for the resolved component
     */
    public async resolve(component: ComponentDefinition): Promise<Stmt.Statement[]> {
        return Promise.all(this.getStatements(component)).then(this.flatten);
    }

    private flatten(statementMap: Stmt.Statement[][]): Stmt.Statement[] {
        let statements = statementMap.shift() || [];
        while (statementMap.length > 0) {
            let extendedFns = statementMap.shift() || [];
            statements = statements.concat(
                extendedFns.filter(statement => {
                    return statement instanceof Stmt.Function;
                })
            );
        }
        return statements;
    }

    private *getStatements(component: ComponentDefinition) {
        yield this.parserLexerFn(component.scripts.map(c => c.uri));
        let currentComponent: ComponentDefinition | undefined = component;
        while (currentComponent.extends) {
            let previousComponent = currentComponent;
            currentComponent = this.componentMap.get(currentComponent.extends);
            if (!currentComponent) {
                return Promise.reject({
                    message: `Cannot find extended component ${previousComponent.extends} defined on ${previousComponent.name}`,
                });
            }
            yield this.parserLexerFn(currentComponent.scripts.map(c => c.uri));
        }

        return Promise.resolve();
    }
}
