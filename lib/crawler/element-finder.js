import { SpotlightBorder } from "../elements/spotlight-border.js";
import {
    determineElementType,
    hasLitProperties,
    parseElementProperties,
    getLitLikeProperties,
    parseElements,
    ELEMENT_TYPES,
    getGeneralElementProperties
} from "./element-jsonifier";

/**
    * @typedef FoundComponentExt
    * @property { Array } __LIT_DEV_TOOLS_CHILD_COMPONENTS
    *
    * @typedef { HTMLElement & FoundComponentExt } FoundComponent
    * 
 * */

export function findCustomElements() {
    return findAllComponents(document.body);
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

/**
 * @param { HTMLElement | ShadowRoot } elem
 */
function findAllComponents(elem) {
    const components = /** @type { Array<FoundComponent> } */ (Array.from(
        elem.querySelectorAll("*")
    ));

    for (const comp of components) {
        if (comp.shadowRoot) {
            comp.__LIT_DEV_TOOLS_CHILD_COMPONENTS = findAllElements(comp.shadowRoot);
        }
    }

    return components.filter((elem) =>
        customElements.get(elem.nodeName.toLowerCase())
    );
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

export function updateElementProperty(updateData) {
    console.log("Updatedata: ", updateData);
    const targetElement = getElementByIndex(updateData.index);
    // TODO(Matsuuu): Update this function to take into account the type of element we are
    // using with ELEMENT_TYPE, and then use a property setter / setAttribute / toggleAttribute accordingly
    targetElement[updateData.key] = updateData.value;
}

export function queryElements() {
    const customElements = findCustomElements();
    const eventData = { detail: parseElements(customElements) };
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_QUERY_RESULT", eventData)
    );
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
        const spotlitElement = getElementByIndex(index);
        const domRect = spotlitElement.getBoundingClientRect();

        spotlight.updateSpotlight(
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
        spotlight.updateSpotlight({ x: 0, y: 0 }, { x: 0, y: 0 });
    }
}

/**
 * Selects the given element by index and returns the property values of the element
 *
 * @param {number} index
 */
export function selectElement(index) {
    const selectedElement = getElementByIndex(index);
    const eventData = { detail: parseElementProperties(selectedElement, index) };

    console.log(eventData);
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
${parseElements.toString()}
${parseElementProperties.toString()}
${findCustomElements.toString()}
${findAllComponents.toString()}
${queryElements.toString()}
${findAllElements.toString()}
${highlightElement.toString()}
${selectElement.toString()}
${getElementByIndex.toString()}
${updateElementProperty.toString()}
${determineElementType.toString()}
${hasLitProperties.toString()}
${getLitLikeProperties.toString()}
${getGeneralElementProperties.toString()}
const ELEMENT_TYPES = ${JSON.stringify(ELEMENT_TYPES)};
`;
