/**
 * @typedef FoundElement
 * @property {string} name
 * @property {number} index
 * @property {number} __WC_DEV_TOOLS_ELEMENT_DEPTH
 * @property {string} __WC_DEV_TOOLS_NODE_STRING
 * @property {boolean} __WC_DEV_TOOLS_ELEMENT_IS_DEFINED
 *
 * */

import { ELEMENT_DEPTH, ELEMENT_INDEX } from './crawler-constants';
import { buildNodeText, elementIsDefined, getElementDeclaration } from './crawler-utils';
import { determineElementType } from './element-types';

/**
 * @typedef {FoundElement} FoundElementWithRefFields
 * @property {HTMLElement} element
 *
 * @typedef {FoundElement & FoundElementWithRefFields} FoundElementWithRef
 * */

/**
 * ParseElements goes through the Custom Element DOM nodes
 * and maps them into 3 separate collections:
 *
 * - elementsArray for listing the elements in the DevTools
 * - elementsRefArray for accessing the same nodes in the browser window
 *
 *   elementsRefArray is stored in the __WC_DEV_TOOLS_FOUND_ELEMENTS -window-object
 *
 * @param {Array<HTMLElement>} elements
 * */
export function parseElements(elements) {
    const elementsArray = [];
    // ElementsRefArray contains references to the actual DOM
    // objects, which can't be passed to the devtools window, but
    // are useful when we later on modify the values of DOM nodes.
    const elementsRefArray = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element[ELEMENT_INDEX] = i;
        const elementName = element.nodeName.toLowerCase();

        /** @type { FoundElement } */
        const elementData = {
            name: elementName,
            index: i,
            __WC_DEV_TOOLS_ELEMENT_DEPTH: element[ELEMENT_DEPTH],
            __WC_DEV_TOOLS_NODE_STRING: buildNodeText(element),
            __WC_DEV_TOOLS_ELEMENT_IS_DEFINED: elementIsDefined(element),
        };

        elementsArray.push(elementData);
        elementsRefArray.push({ ...elementData, element });

    }

    return { elementsArray, elementsRefArray };
}

/**
 * parseElementProperties determines the type of component we're inspecting,
 * what it's custom properties/attributes are, and what their values are, respecting gettings/setters.
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementData
 *
 * @returns {DevToolsElement}
 */
export function parseElementProperties(element, elementData) {
    /** @type DevToolsElement */
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
