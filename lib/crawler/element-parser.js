
import { getElementDeclaration } from './crawler-utils';
import { determineElementType } from './element-types';

/**
 * parseElementProperties determines the type of component we're inspecting,
 * what it's custom properties/attributes are, and what their values are, respecting gettings/setters.
 *
 * @param {HTMLElement} element
 * @param {import('../types/devtools-element').DevToolsElement} elementData
 *
 * @returns {import('../types/devtools-element').DevToolsElement}
 */
export function parseElementProperties(element, elementData) {
    /** @type import('../types/devtools-element').DevToolsElement */
    const customElementDeclaration = getElementDeclaration(element);

    if (!customElementDeclaration) return elementData;

    const elementType = determineElementType(customElementDeclaration, element);

    if (!elementData.parentClass) {
        elementData.parentClass = {
            name: Object.getPrototypeOf(element.constructor).name,
        };
    }
    elementData.typeInDevTools = elementType.id;
    // Add the class declaration code as string. Add export in the beginning to
    // make it analyzable by the CEM analyzer
    elementData.declaration = 'export ' + customElementDeclaration.toString();

    // Parse data with the proper parser for the type and sets it to elementState
    elementType.parser(customElementDeclaration, element, elementData);
    return elementData;
}
