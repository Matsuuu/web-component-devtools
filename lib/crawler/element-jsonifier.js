/**
 * @typedef FoundElement
 * @property {string} name
 * @property {number} index
 * @property {number} __LIT_DEV_TOOLS_ELEMENT_DEPTH
 *
 * */

import { getElementByIndex } from "./element-finder";

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
            __LIT_DEV_TOOLS_ELEMENT_DEPTH: element["__LIT_DEV_TOOLS_ELEMENT_DEPTH"],
        };

        elementsArray.push(elementData);
        elementsRefArray.push({ ...elementData, element });

        if (!elementsMap[elementName]) {
            elementsMap[elementName] = elementData;
        }
    }

    window["__WC_DEV_TOOLS_FOUND_ELEMENTS"] = elementsRefArray;
    return { elementsArray, elementsMap };
}

/**
 * parseElementProperties determines the type of component we're inspecting,
 * what it's custom properties/attributes are, and what their values are, respecting gettings/setters.
 * @param {HTMLElement} element
 * @param {number} index
 */
export function parseElementProperties(element, index) {
    const elementState = {};
    const elementName = element.nodeName.toLowerCase();
    const elementCustomElementDeclaration = customElements.get(elementName);

    const elementType = determineElementType(elementCustomElementDeclaration);
    console.log(elementType);
    console.log(ELEMENT_TYPES);

    elementState.properties = elementType.parser(
        elementCustomElementDeclaration,
        element
    );

    elementState.__WC_DEV_TOOLS_ELEMENT_NAME = element.localName;
    elementState.__WC_DEV_TOOLS_SELECTED_INDEX = index;
    elementState.__WC_DEV_TOOLS_ELEMENT_TYPE = elementType.id;

    return elementState;
}

/**
 * @param {any} customElementDeclaration
 */
function determineElementType(customElementDeclaration) {
    if (hasLitProperties(customElementDeclaration)) return ELEMENT_TYPES.LIT;

    return ELEMENT_TYPES.VANILLA;
}

/**
 * @param {{ _classProperties: any; }} customElementDeclaration
 */
function hasLitProperties(customElementDeclaration) {
    return typeof customElementDeclaration._classProperties !== "undefined";
}

/**
 * For presumed vanilla elements, we take a look at the observedAttributes,
 * and go from there. Naively guessing the type of the element.
 *
 * In the Devtools UI, we will allow the user to change the type if it's wrong
 * and save it in some kind of database.
 *
 * @param {{ observedAttributes: any; }} customElementDeclaration
 * @param {HTMLElement} element
 */
function getGeneralElementProperties(customElementDeclaration, element) {
    const properties = {};
    const observedAttributes = customElementDeclaration.observedAttributes;

    if (!observedAttributes) return properties;

    for (const key of observedAttributes) {
        let type = String.name;
        /** @type {any} */
        let value = element.getAttribute(key);

        if (value == null) {
            // If the attribute is null, we can check the actual property
            // value, and in case there is one set, we can ducktype from that
            const propValue = element[key];
            if (propValue != null) value = propValue;
        }

        if (attributeIsBoolean(value)) {
            type = Boolean.name;
            value = value === "" || value === "true";
        }

        properties[key] = {
            key,
            type,
            value,
        };
    }

    return properties;
}

/**
 * @param {import("./element-finder").UpdateData} updateData
 */
function updateGeneralElementValue(updateData) {
    console.log("Update general element value", updateData);
    /** @type { HTMLElement } */
    const element = window["__WC_DEV_TOOLS_SELECTED_ELEMENT"];
    const isBoolean = attributeIsBoolean(updateData.value);
    if (isBoolean) {
        if (updateData.value)
            element.setAttribute(updateData.key, "");
        else
            element.removeAttribute(updateData.key);
    } else {
        if (updateData.value && updateData.value.length > 0)
            element.setAttribute(updateData.key, updateData.value);
        else
            element.removeAttribute(updateData.key);
    }
}

/**
 * @param {import("./element-finder").UpdateData} updateData
 */
function updateLitLikeValue(updateData) {
    console.log("Update lit like value", updateData);
    const element = window["__WC_DEV_TOOLS_SELECTED_ELEMENT"];
    element[updateData.key] = updateData.value;
}

/**
 * @param {string} value
 */
function attributeIsBoolean(value) {
    if (typeof value === "boolean") {
        return true;
    }
    if (value === "true" || value === "false") {
        return true;
    }
    if (value != null && value.length <= 0) {
        return true;
    }
    return false;
}

/**
 * Lit declares the properties in a _classProperties -field in the custom element class declaration.
 * We can scrape the data from there for Lit-like elements
 *
 * @param {{ _classProperties: any; }} customElementDeclaration
 * @param {HTMLElement} element
 */
function getLitLikeProperties(customElementDeclaration, element) {
    const properties = {};
    const classProperties = customElementDeclaration._classProperties;

    for (const [key, property] of classProperties) {
        properties[key] = {
            key,
            type: property.type?.name ?? String.name,
            reflect: !!property.reflect,
            attribute: !!property.attribute,
            value: element[key],
        };
    }

    return properties;
}

/**
 * @typedef ElementTypeMap
 * @type {Object.<string, ElementType>}
 *
 * @callback ParserCallback
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 *
 * @callback OnUpdateCallback
 * @param {import("./element-finder").UpdateData} UpdateData
 *
 * @typedef ElementType
 * @property {number} id
 * @property {ParserCallback} parser
 * @property {OnUpdateCallback} onUpdate
 * */

export const jsonifierScripts = `
${getGeneralElementProperties.toString()}
${getLitLikeProperties.toString()}
${attributeIsBoolean.toString()}
${hasLitProperties.toString()}
${determineElementType.toString()}
${parseElementProperties.toString()}
${parseElements.toString()}
${getElementTypeById.toString()}
${updateGeneralElementValue.toString()}
${updateLitLikeValue.toString()}


const ELEMENT_TYPES = {
    VANILLA: {
        id: 0,
        parser: getGeneralElementProperties,
        onUpdate: updateGeneralElementValue
    },
    LIT: {
        id: 1,
        parser: getLitLikeProperties,
        onUpdate: updateLitLikeValue
    },
};
`;

/**
 * Copy the values here into the jsonifierScripts export in string
 * format so that they get copied to client side
 *
 *   @type ElementTypeMap
 * */
const ELEMENT_TYPES = {
    VANILLA: {
        id: 0,
        parser: getGeneralElementProperties,
        onUpdate: updateGeneralElementValue,
    },
    LIT: {
        id: 1,
        parser: getLitLikeProperties,
        onUpdate: updateLitLikeValue,
    },
};

export function getElementTypeById(id) {
    for (const [_, val] of Object.entries(ELEMENT_TYPES)) {
        if (val.id === id) return val;
    }
    return null;
}
