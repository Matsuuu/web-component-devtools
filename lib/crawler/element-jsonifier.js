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
 * @param {Array<HTMLElement>} elements
 */
export function parseElements(elements) {
    const elementsMap = {};
    const elementsArray = [];
    // For the actual DOM. Not shippable with messages
    const elementsArrayWithRefs = [];

    let i = 0;
    for (const elem of elements) {
        const elementName = elem.nodeName.toLowerCase();
        /** @type { FoundElement} */
        const elementData = {
            name: elementName,
            index: i,
        };

        i += 1;

        elementsArray.push(elementData);
        elementsArrayWithRefs.push({ ...elementData, element: elem });

        if (elementsMap[elementName]) {
            continue;
        }
        elementsMap[elementName] = elementData;
    }

    window["__WC_DEV_TOOLS_FOUND_ELEMENTS"] = elementsArrayWithRefs;
    return { elementsArray, elementsMap };
}

/**
 * @param {HTMLElement} element
 */
export function parseElementProperties(element, index) {
    const elementState = {};
    const elementName = element.nodeName.toLowerCase()
    const elementCustomElementDeclaration = customElements.get(elementName)
    const classProperties = elementCustomElementDeclaration._classProperties;

    elementState.properties = {};

    for (const [key, val] of classProperties) {
        elementState.properties[key] = getPropertyData(element, key, val);
    }
    elementState.__WC_DEV_TOOLS_SELECTED_INDEX = index;

    return elementState;
}

/**
 * @param {HTMLElement} element
 * @param {string} key
 * @param {{type: any;reflect: any;attribute: any;}} property
 */
export function getPropertyData(element, key, property) {
    return {
        key,
        type: property.type?.name ?? String.name,
        reflect: !!property.reflect,
        attribute: !!property.attribute,
        value: element[key]
    };
}
