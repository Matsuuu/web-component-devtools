/**
 * @typedef FoundElement
 * @property {string} name
 * @property {number} index
 * @property {Object} properties
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
            properties: Object.keys(elem).filter((key) => key.startsWith("__")),
        };

        i += 1;

        elementsArray.push(elementData);
        elementsArrayWithRefs.push({ ...elementData, element: elem });

        if (elementsMap[elementName]) {
            continue;
        }
        elementsMap[elementName] = elementData;
    }

    window["__LIT_DEV_TOOLS_FOUND_ELEMENTS"] = elementsArrayWithRefs;
    return { elementsArray, elementsMap };
}

/**
 * @param {HTMLElement} element
 */
export function parseElementProperties(element) {
    const propertyKeys = Object.keys(element).filter((key) => key.startsWith("__"));
    const elementState = {};
    propertyKeys.forEach(propKey => {
        elementState[propKey] = element[propKey]
    });

    return elementState;
}
