import { parseElements } from "./element-jsonifier";

export function findCustomElements() {
    const elements = Array.from(findAllElements(document.body)).filter((elem) =>
        customElements.get(elem.nodeName.toLowerCase())
    );

    return elements;
}

/**
 * @param {HTMLElement | ShadowRoot} elem
 *
 * @returns {Array<HTMLElement>} elements
 */
export function findAllElements(elem) {
    let elements = /** @type { Array<HTMLElement> } */ (Array.from(
        elem.querySelectorAll("*")
    ));

    for (const e of elements) {
        if (e.shadowRoot) {
            elements = [...elements, ...findAllElements(e.shadowRoot)];
        }
    }

    return elements;
}

export function initDomQueryListener() {
    document.addEventListener("__LIT_DEV_TOOLS_QUERY_REQUEST", () => {
        const customElements = findCustomElements();
        const eventData = { detail: parseElements(customElements) };
        document.dispatchEvent(
            new CustomEvent("__LIT_DEV_TOOLS_QUERY_RESULT", eventData)
        );
    });

    document.addEventListener("__LIT_DEV_TOOLS_HIGHLIGHT_ELEMENT", (
    /** @type CustomEvent */ e
    ) => highlightElement(e.detail.index));
}

/**
 * @param {Number} index
 */
export function highlightElement(index) {
    document.querySelector("");

    /** @type {import("./element-jsonifier").FoundElementWithRefFields} */
    const elements = window["__LIT_DEV_TOOLS_FOUND_ELEMENTS"];
    console.log(elements[index]);
    console.log(elements[index].element.style);
    elements[index].element.style.backgroundColor = "#000";
}
