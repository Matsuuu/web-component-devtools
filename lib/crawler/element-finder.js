import { SpotlightBorder } from "../elements/spotlight-border.js";
import {
    parseElements,
    parseElementProperties,
    jsonifierScripts,
    getElementTypeById,
} from "./element-jsonifier";

/**
 * @typedef FoundComponentExt
 * @property { Array } __LIT_DEV_TOOLS_CHILD_COMPONENTS
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

    return elements;
}

export function initDomQueryListener() {
    document.addEventListener("__WC_DEV_TOOLS_QUERY_REQUEST", queryElements);
    document.addEventListener("__WC_DEV_TOOLS_HIGHLIGHT_ELEMENT", (
    /** @type CustomEvent */ e
    ) => highlightElement(e.detail.index));
    document.addEventListener("__WC_DEV_TOOLS_SELECT_REQUEST", (
    /** @type CustomEvent */ e
    ) => selectElement(e.detail.index));

    document.addEventListener("__WC_DEV_TOOLS_UPDATE_PROPERTY", (
    /** @type CustomEvent */ e
    ) => updateElementProperty(e.detail));
}

/**
 * @typedef UpdateData
 * @property {number} type
 * @property {number} index
 * @property {string} key
 * @property {any} value
 * @property {number} elementType
 * */

/**
 * @param {UpdateData} updateData
 */
export function updateElementProperty(updateData) {
    console.log("Updatedata: ", updateData);
    const targetElement = getElementByIndex(updateData.index);
    // TODO(Matsuuu): Update this function to take into account the type of element we are
    // using with ELEMENT_TYPE, and then use a property setter / setAttribute / toggleAttribute accordingly
    const elementType = getElementTypeById(updateData.elementType);

    elementType.onUpdate(updateData);
}

export function queryElements() {
    const filterOutNativeElements = true; // TODO(Matsuuu): Make this toggleable

    let customElements = findCustomElements();
    calculateElementDepths(customElements);

    if (filterOutNativeElements) {
        customElements = customElements.filter((elem) =>
            window.customElements.get(elem.nodeName.toLowerCase())
        );
    }
    const eventData = { detail: parseElements(customElements) };
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_QUERY_RESULT", eventData)
    );
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
        elem["__LIT_DEV_TOOLS_ELEMENT_DEPTH"] = depth;
    });
}

/**
 * @param {Number} index
 */
export function highlightElement(index) {
    /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
    let spotlight = window["__WC_DEV_TOOLS_SPOTLIGHT"];
    if (!spotlight) {
        spotlight =
            /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
            (document.createElement("spotlight-border"));

        SpotlightBorder.init();
        document.body.appendChild(spotlight);
        window["__WC_DEV_TOOLS_SPOTLIGHT"] = spotlight;
    }

    if (index >= 0) {
        spotlight.style.visibility = "visible";
        const spotlitElement = getElementByIndex(index);
        const scrollingParent = getScrollingParent(spotlitElement); // Could be used to scroll to element
        const domRect = spotlitElement.getBoundingClientRect();

        spotlight.updateSpotlight(
            spotlitElement.localName,
            {
                x: domRect.x,
                y: domRect.y,
            },
            {
                x: domRect.width,
                y: domRect.height,
            }
        );
    } else {
        // If the element wants to highlight "-1", it means "Turn off the highlight"
        spotlight.updateSpotlight("", { x: 0, y: 0 }, { x: 0, y: 0 });
        spotlight.style.visibility = "hidden";
    }
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
 * Selects the given element by index and returns the property values of the element
 *
 * @param {number} index
 */
export function selectElement(index) {
    const selectedElement = getElementByIndex(index);
    window["__WC_DEV_TOOLS_SELECTED_ELEMENT"] = selectedElement;
    const eventData = { detail: parseElementProperties(selectedElement, index) };

    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_SELECT_RESULT", eventData)
    );
}

/**
 * @param {number} index
 * @returns { HTMLElement }
 */
export function getElementByIndex(index) {
    /** @type {import("./element-jsonifier").FoundElementWithRefFields} */
    const elements = window["__WC_DEV_TOOLS_FOUND_ELEMENTS"];

    const spotlitElement = elements[index].element;
    return spotlitElement;
}

// Quick and dirty way to append code on the page
// We could do better
export const finderScripts = `
${initDomQueryListener.toString()}
${findCustomElements.toString()}
${calculateElementDepths.toString()}
${queryElements.toString()}
${findAllElements.toString()}
${highlightElement.toString()}
${selectElement.toString()}
${getElementByIndex.toString()}
${updateElementProperty.toString()}
${getScrollingParent.toString()}
${jsonifierScripts}
`;
