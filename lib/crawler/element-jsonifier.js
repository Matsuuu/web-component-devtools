/**
 * @typedef FoundElement
 * @property {string} name
 * @property {number} index
 *
 * */

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

export const ELEMENT_TYPES = {
    VANILLA: 0,
    LIT: 1,
};

/*
 *  TODO(Matsuuu): Consider packing the element types into objects like:
 *
 *  VANILLA: {
 *      id: 0,
 *      parser: getGeneralElementProperties
 *      onUpdate: updateGeneralElementAttribute
 *  }
 * */

/**
 * parseElementProperties determines the type of component we're inspecting,
 * what it's custom properties/attributes are, and what their values are, respecting gettings/setters.
 *
 * @param {HTMLElement} element
 */
export function parseElementProperties(element, index) {
    const elementState = {};
    const elementName = element.nodeName.toLowerCase();
    const elementCustomElementDeclaration = customElements.get(elementName);

    const elementType = determineElementType(elementCustomElementDeclaration);

    switch (elementType) {
        case ELEMENT_TYPES.LIT:
            elementState.properties = getLitLikeProperties(
                elementCustomElementDeclaration,
                element
            );
            break;
        case ELEMENT_TYPES.VANILLA:
            elementState.properties = getGeneralElementProperties(
                elementCustomElementDeclaration,
                element
            );
            break;
    }

    elementState.__WC_DEV_TOOLS_SELECTED_INDEX = index;
    elementState.__WC_DEV_TOOLS_ELEMENT_TYPE = elementType;

    return elementState;
}

export function determineElementType(customElementDeclaration) {
    if (hasLitProperties(customElementDeclaration)) return ELEMENT_TYPES.LIT;

    return ELEMENT_TYPES.VANILLA;
}

/**
 * @param {{ _classProperties: any; }} customElementDeclaration
 */
export function hasLitProperties(customElementDeclaration) {
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
export function getGeneralElementProperties(customElementDeclaration, element) {
    const properties = {};
    const observedAttributes = customElementDeclaration.observedAttributes;

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
 * @param {string} value
 */
export function attributeIsBoolean(value) {
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
export function getLitLikeProperties(customElementDeclaration, element) {
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
