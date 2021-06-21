import { SpotlightBorder } from "../elements/spotlight-border.js";
import {
    CONTEXT_MENU_TARGET,
    QUERY_RESULT,
    SELECTED_ELEMENT,
    SELECT_RESULT,
    SPOTLIGHT_ELEMENT,
} from "./crawler-constants.js";
import {
    findElementsOnPage,
    getCachedFoundElements,
    getElementByIndex,
} from "./element-finder";
import { parseElementProperties } from "./element-parser.js";
import { getElementTypeById } from "./element-types";

/**
 * @param {MouseEvent} e
 */
export function updateLatestContextMenuHit(e) {
    /** @type { HTMLElement } */
    let clickedElem = null;
    let clickedWebComponent = null;
    const clickPath = e.composedPath();

    while (clickPath.length > 0 && !clickedWebComponent) {
        clickedElem = /** @type { HTMLElement } */ (clickPath.shift());
        if (clickedElem.nodeName && customElements.get(clickedElem.nodeName.toLowerCase())) {
            clickedWebComponent = clickedElem;
        }
    }

    window[CONTEXT_MENU_TARGET] = clickedWebComponent;
}

export function getContextMenuTarget() {
    return window[CONTEXT_MENU_TARGET];
}

export function inspectElement() {
    const targetElement = getContextMenuTarget();
    let elementsOnPage = getCachedFoundElements();
    if (!elementsOnPage) {
        const parsedElements = findElementsOnPage();
        elementsOnPage = parsedElements.elementsRefArray;
    }

    let elementToInspect = null;
    for (const elem of elementsOnPage) {
        if (elem.element === targetElement) {
            elementToInspect = elem;
        }
    }

    // TODO(Matsuuu): Open up WC dev tools
    if (elementToInspect) {
        selectElement(elementToInspect.index);
    }
}

export function queryElements() {
    const parsedElements = findElementsOnPage();

    const eventData = {
        detail: {
            elementsArray: parsedElements.elementsArray,
            elementsMap: parsedElements.elementsMap,
        },
    };
    document.dispatchEvent(new CustomEvent(QUERY_RESULT, eventData));
}

/**
 * @param {import("./element-updaters.js").UpdateData} updateData
 */
export function updateElementProperty(updateData) {
    const elementType = getElementTypeById(updateData.elementType);
    elementType.onUpdate(updateData);
}

/**
 * @param {Number} index
 */
export function highlightElement(index) {
    /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
    let spotlight = window[SPOTLIGHT_ELEMENT];
    if (!spotlight) {
        spotlight =
            /** @type {import("../elements/spotlight-border.js").SpotlightBorder} */
            (document.createElement("wc-devtools-spotlight-border"));

        SpotlightBorder.init();
        document.body.appendChild(spotlight);
        window[SPOTLIGHT_ELEMENT] = spotlight;
    }

    if (index >= 0) {
        spotlight.style.visibility = "visible";
        const spotlitElement = getElementByIndex(index);
        const domRect = spotlitElement.getBoundingClientRect();

        spotlight.updateSpotlight(
            spotlitElement.localName,
            {
                x: domRect.left,
                y: domRect.top,
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

/**
 * Selects the given element by index and returns the property values of the element
 *
 * @param {number} index
 */
export function selectElement(index) {
    const selectedElement = getElementByIndex(index);
    window[SELECTED_ELEMENT] = selectedElement;
    const eventData = { detail: parseElementProperties(selectedElement, index) };

    document.dispatchEvent(
        new CustomEvent(SELECT_RESULT, eventData)
    );
}

export const domActionsInject = `
${updateLatestContextMenuHit.toString()}
${inspectElement.toString()}
${queryElements.toString()}
${updateElementProperty.toString()}
${highlightElement.toString()}
${selectElement.toString()}
`;
