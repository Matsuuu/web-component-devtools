import { SpotlightBorder } from "../elements/spotlight-border.js";
import { getPropertyData, parseElementProperties, parseElements } from "./element-jsonifier";

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
    document.addEventListener("__LIT_DEV_TOOLS_QUERY_REQUEST", queryElements);
    document.addEventListener("__LIT_DEV_TOOLS_HIGHLIGHT_ELEMENT", (
    /** @type CustomEvent */ e
    ) => highlightElement(e.detail.index));
    document.addEventListener("__LIT_DEV_TOOLS_SELECT_REQUEST", (
    /** @type CustomEvent */ e
    ) => selectElement(e.detail.index));

    document.addEventListener("__LIT_DEV_TOOLS_UPDATE_PROPERTY", (
    /** @type CustomEvent */ e
    ) => updateElementProperty(e.detail));
}

export function updateElementProperty(updateData) {
    console.log("Updatedata: ", updateData);
    const targetElement = getElementByIndex(updateData.index);
    targetElement[updateData.key] = updateData.value;
}

export function queryElements() {
    const customElements = findCustomElements();
    const eventData = { detail: parseElements(customElements) };
    document.dispatchEvent(
        new CustomEvent("__LIT_DEV_TOOLS_QUERY_RESULT", eventData)
    );
}

/**
 * @param {Number} index
 */
export function highlightElement(index) {
    /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
    let spotlight = window["__LIT_DEV_TOOLS_SPOTLIGHT"];
    if (!spotlight) {
        spotlight =
            /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
            (document.createElement("spotlight-border"));

        SpotlightBorder.init();
        document.body.appendChild(spotlight);
        window["__LIT_DEV_TOOLS_SPOTLIGHT"] = spotlight;
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
        new CustomEvent("__LIT_DEV_TOOLS_SELECT_RESULT", eventData)
    );
}

/**
 * @param {number} index
 * @returns { HTMLElement }
 */
export function getElementByIndex(index) {
    /** @type {import("./element-jsonifier").FoundElementWithRefFields} */
    const elements = window["__LIT_DEV_TOOLS_FOUND_ELEMENTS"];

    const spotlitElement = elements[index].element;
    return spotlitElement;
}

export const finderScripts = `
${initDomQueryListener.toString()}
${parseElements.toString()}
${parseElementProperties.toString()}
${findCustomElements.toString()}
${queryElements.toString()}
${findAllElements.toString()}
${highlightElement.toString()}
${selectElement.toString()}
${getElementByIndex.toString()}
${getPropertyData.toString()}
${updateElementProperty.toString()}
`;
