/**
 * @typedef FoundElement
 * @property {string} name
 * @property {number} index
 * @property {number} __WC_DEV_TOOLS_ELEMENT_DEPTH
 *
 * */

import { ELEMENT_DEPTH } from "./crawler-constants";
import { determineElementType } from "./element-types";

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
 * - elementsMap for separated collection of unique components
 *
 *   elementsRefArray is stored in the __WC_DEV_TOOLS_FOUND_ELEMENTS -window-object
 *
 * @param {Array<HTMLElement>} elements
 * */
export function parseElements(elements) {
    const elementsMap = {};
    const elementsArray = [];
    // ElementsRefArray contains references to the actual DOM
    // objects, which can't be passed to the devtools window, but
    // are useful when we later on modify the values of DOM nodes.
    const elementsRefArray = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementName = element.nodeName.toLowerCase();

        /** @type { FoundElement } */
        const elementData = {
            name: elementName,
            index: i,
            __WC_DEV_TOOLS_ELEMENT_DEPTH: element[ELEMENT_DEPTH],
        };

        elementsArray.push(elementData);
        elementsRefArray.push({ ...elementData, element });

        if (!elementsMap[elementName]) {
            elementsMap[elementName] = elementData;
        }
    }

    return { elementsArray, elementsMap, elementsRefArray };
}

/**
 * @typedef ParsedElementProperties
 * @property {Object} properties
 * @property {string} __WC_DEV_TOOLS_ELEMENT_NAME
 * @property {number} __WC_DEV_TOOLS_SELECTED_INDEX
 * @property {number} __WC_DEV_TOOLS_ELEMENT_TYPE
 * */

/**
 * parseElementProperties determines the type of component we're inspecting,
 * what it's custom properties/attributes are, and what their values are, respecting gettings/setters.
 * @param {HTMLElement} element
 * @param {number} index
 */
export function parseElementProperties(element, index) {
    /** @type ParsedElementProperties */
    const elementState = {};
    const elementName = element.nodeName.toLowerCase();
    const elementCustomElementDeclaration = customElements.get(elementName);

    elementState.__WC_DEV_TOOLS_ELEMENT_NAME = element.localName;
    elementState.__WC_DEV_TOOLS_SELECTED_INDEX = index;

    if (!elementCustomElementDeclaration) return elementState;

    const elementType = determineElementType(elementCustomElementDeclaration);
    elementState.__WC_DEV_TOOLS_ELEMENT_TYPE = elementType.id;

    elementState.properties = elementType.parser(
        elementCustomElementDeclaration,
        element
    );

    return elementState;
}

export const parserInject = `
${parseElementProperties.toString()}
${parseElements.toString()}

`;
