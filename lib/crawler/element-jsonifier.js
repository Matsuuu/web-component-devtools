import { findCustomElements } from "./element-finder";

/**
    * @param {Array<Node>} elements
 */
export function parseElements(elements) {
    const elementsJson = {};

    for (const elem of elements) {
        const elementName = elem.nodeName.toLowerCase();
        if (elementsJson[elementName]) continue;

        elementsJson[elementName] = {
            name: elementName,
            properties: Object.keys(elem).filter(key => key.startsWith("__")),
        };
    }

    return elementsJson;
}

export function initDomQueryListener() {
    document.addEventListener("__LIT_DEV_TOOLS_QUERY_REQUEST", () => {
        const customElements = findCustomElements();
        document.dispatchEvent(new CustomEvent("__LIT_DEV_TOOLS_QUERY_RESULT", { detail: parseElements(customElements) }));
    });
}
