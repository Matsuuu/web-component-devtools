import { parseElements } from "./element-jsonifier";

export function findCustomElements() {
    const elements = Array.from(findAllElements(document.body))
        .filter(elem => customElements.get(elem.nodeName.toLowerCase()))

    //const elementsJson = parseElements(elements);
    return elements;
}

/**
 * @param {Element | ShadowRoot} elem
 */
export function findAllElements(elem) {
    let elements = Array.from(elem.querySelectorAll("*"));

    for (const e of elements) {
        if (e.shadowRoot) {
            elements = [...elements, ...findAllElements(e.shadowRoot)];
        }
    }

    return elements;
}
