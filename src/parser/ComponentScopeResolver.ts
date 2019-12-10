import { ComponentDefinition } from "../componentprocessor";
import { Statement } from "./Statement";

export class ComponentScopeResolver {
    constructor() {
        // Do the thing
    }

    /**
     * Resolves the component functions in scope based on the extends hierarchy.
     * @param component Instance of the component to resolve function scope for.
     * @param componentMap Component definition map to reference for function resolution of given component.
     * @returns All the statements
     */
    public resolve(
        component: ComponentDefinition,
        componentMap: Map<string, ComponentDefinition>
    ): Statement[] {
        return [];
    }
}
