import { SpotlightBorder } from '../elements/spotlight-border.js';
import {
    CONTEXT_MENU_TARGET,
    QUERY_RESULT,
    SELECTED_ELEMENT,
    SELECT_RESULT,
    SPOTLIGHT_ELEMENT,
} from './crawler-constants.js';
import { findElementsOnPage, getCachedFoundElements, getElementByIndex } from './element-finder';
import { parseElementProperties } from './element-parser.js';
import { getElementTypeById } from './element-types';

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

export function callFunction(event) {
    const method = event.detail.method;
    const targetElement = getElementByIndex(event.detail.targetIndex);

    if (method.parameters) {
        targetElement[method.name].call(targetElement, ...event.detail.parameters);
    } else {
        targetElement[method.name].call(targetElement);
    }
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

    // TODO(Matsuuu): Open up WC dev tools if possible
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
    elementType.onUpdate(updateData, 'property');
}

/**
 * @param {import('./element-updaters.js').UpdateData} updateData
 */
export function updateElementAttribute(updateData) {
    const elementType = getElementTypeById(updateData.elementType);
    elementType.onUpdate(updateData, 'attribute');
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
            (document.createElement('wc-devtools-spotlight-border'));

        SpotlightBorder.init();
        document.body.appendChild(spotlight);
        window[SPOTLIGHT_ELEMENT] = spotlight;
    }

    if (index >= 0) {
        spotlight.style.visibility = 'visible';
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
            },
        );
    } else {
        // If the element wants to highlight "-1", it means "Turn off the highlight"
        spotlight.updateSpotlight('', { x: 0, y: 0 }, { x: 0, y: 0 });
        spotlight.style.visibility = 'hidden';
    }
}

/**
 * Selects the given element by index and returns the property values of the element
 * @param {any} eventData
 */
export function selectElement(eventData) {
    const selectedElement = getElementByIndex(eventData.indexInDevTools);
    window[SELECTED_ELEMENT] = selectedElement;

    const elementProperties = parseElementProperties(selectedElement, eventData);
    const viableData = {};
    removeUnsendableObjects(viableData, elementProperties);

    const returnEventData = { detail: viableData };
    console.log(returnEventData);

    document.dispatchEvent(new CustomEvent(SELECT_RESULT, returnEventData));
}

/**
 * Removes some of the unwanted nasties we don't want to show in the
 * devtools and tries to parse a nice new object from the vals.
 * */
function removeUnsendableObjects(returnData, elementProperties, cache = [], layer = 0) {
    if (layer > 100) {
        // Fallback to avoid stack overflow
        return;
    }
    for (const [key, val] of Object.entries(elementProperties)) {
        // Remove nodes, function and already cached object values (most likely circulars)
        if (
            val instanceof Node ||
            typeof val === 'function' ||
            (typeof val === 'object' && val != null && cache.includes(val))
        ) {
            delete returnData[key];
            continue;
        }

        if (typeof val === 'object' && val != null) {
            returnData[key] = Array.isArray(val) ? [...val] : { ...val };
            cache.push(val);
            removeUnsendableObjects(returnData[key], val, cache, layer + 1);
        } else {
            returnData[key] = val;
        }
    }
}

export const domActionsInject = `
${updateLatestContextMenuHit.toString()}
${inspectElement.toString()}
${queryElements.toString()}
${updateElementProperty.toString()}
${highlightElement.toString()}
${selectElement.toString()}
${getContextMenuTarget.toString()}
${callFunction.toString()}
${updateElementAttribute.toString()}
${removeUnsendableObjects.toString()}
`;
