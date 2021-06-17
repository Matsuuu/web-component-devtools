import {
    ELEMENT_DEPTH,
    FOUND_ELEMENTS,
    SELECTED_ELEMENT,
} from "./crawler-constants.js";
import { parseElements } from "./element-parser.js";

/**
 * @typedef FoundComponentExt
 * @property { Array } __WC_DEV_TOOLS_CHILD_COMPONENTS
 *
 * @typedef { HTMLElement & FoundComponentExt } FoundComponent
 *
 * */

export function findCustomElements() {
    return findAllElements(document.body);
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

    return elements.filter(elem => elem.nodeName.toLowerCase() !== "wc-devtools-spotlight-border");
}

export function findElementsOnPage() {
    const filterOutNativeElements = true; // TODO(Matsuuu): Make this toggleable

    let customElements = findCustomElements();
    calculateElementDepths(customElements);

    if (filterOutNativeElements) {
        customElements = customElements.filter((elem) =>
            window.customElements.get(elem.nodeName.toLowerCase())
        );
    }
    const parsedElements = parseElements(customElements);
    window[FOUND_ELEMENTS] = parsedElements.elementsRefArray;

    return parsedElements;
}

export function getCachedFoundElements() {
    return window[FOUND_ELEMENTS];
}

/**
 * @param {Array<HTMLElement>} elements
 */
function calculateElementDepths(elements) {
    elements.forEach((elem) => {
        let depth = 0;
        let el = elem.parentElement;
        while (el && el.nodeName !== "BODY") {
            depth++;
            el = el.parentElement;
        }
        elem[ELEMENT_DEPTH] = depth;
    });
}

function getScrollingParent(elem) {
    if (elem == null) {
        return null;
    }
    if (elem.scrollHeight > elem.clientHeight) {
        return elem;
    } else {
        return getScrollingParent(elem.parentNode ?? elem.host);
    }
}

/**
 * @param {number} index
 * @returns { HTMLElement }
 */
export function getElementByIndex(index) {
    /** @type {import("./element-parser.js").FoundElementWithRefFields} */
    const elements = window[FOUND_ELEMENTS];

    const spotlitElement = elements[index]?.element;
    return spotlitElement;
}

export function getCurrentSelectedElement() {
    return window[SELECTED_ELEMENT];
}

// Quick and dirty way to append code on the page
// We could do better

export const finderScriptsInject = `
${findCustomElements.toString()}
${calculateElementDepths.toString()}
${findAllElements.toString()}
${getElementByIndex.toString()}
${getScrollingParent.toString()}
${getCachedFoundElements.toString()}
${findElementsOnPage.toString()}
${getCurrentSelectedElement.toString()}
`;
