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
        const elementData = {
            name: elementName,
            index: i,
            properties: Object.keys(elem).filter(key => key.startsWith("__")),
            dimensions: {
                offsetHeight: elem.offsetHeight,
                offsetWidth: elem.offsetWidth,
                offsetLeft: elem.offsetLeft,
                offsetTop: elem.offsetTop
            }
        };

        i += 1;

        elementsArray.push(elementData);
        elementsArrayWithRefs.push({ ...elementData, element: elem });

        if (elementsMap[elementName]) {
            continue;
        }
        elementsMap[elementName] = elementData;
    }

    window.__LIT_DEV_TOOLS_FOUND_ELEMENTS = elementsArrayWithRefs;
    return { elementsArray, elementsMap };
}
