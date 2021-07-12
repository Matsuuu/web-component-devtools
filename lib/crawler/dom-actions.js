import { SpotlightBorder } from '../elements/spotlight-border.js';
import {
    CONTEXT_MENU_TARGET,
    DOM_CREATED_EVENT,
    QUERY_RESULT,
    SELECTED_ELEMENT,
    SELECT_RESULT,
    SPOTLIGHT_ELEMENT,
} from './crawler-constants.js';
import { buildFunctionText, buildNodeText, throttle } from './crawler-utils.js';
import { findElementsOnPage, getCachedFoundElements, getElementByIndex } from './element-finder';
import { parseElementProperties } from './element-parser.js';
import { getElementTypeById } from './element-types';
import { spyEvents } from './event-observer.js';
import { handleSelectMutationObservers } from './mutation-observer.js';

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
    const methodDescription = event.detail.manifestData.methods.find(meth => meth.name === method.name);
    const params = castParameters(event.detail.parameters, methodDescription);

    if (method.parameters) {
        targetElement[method.name].call(targetElement, ...params);
    } else {
        targetElement[method.name].call(targetElement);
    }
}

/**
 * @param { Array<any> } paramList
 * @param {{ parameters: any[]; }} manifestData
 */
function castParameters(paramList, manifestData) {
    if (!manifestData.parameters) return paramList;

    const castedParams = manifestData.parameters.map((param, i) => {
        const type = param.type?.text;
        switch (type) {
            case 'number':
                return parseFloat(paramList[i]);
            default:
                return paramList[i];
        }
    });

    return castedParams;
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
        const eventData = {
            detail: {
                action: 'SELECT',
                target: {
                    indexInDevTools: elementToInspect.index,
                    name: elementToInspect.element.nodeName.toLowerCase(),
                    tagName: elementToInspect.element.nodeName.toLowerCase(),
                },
            },
        };
        document.dispatchEvent(new CustomEvent(DOM_CREATED_EVENT, eventData));
    }
}

export function queryElements() {
    throttle(() => {
        const parsedElements = findElementsOnPage();

        const eventData = {
            detail: {
                elementsArray: parsedElements.elementsArray,
                elementsMap: parsedElements.elementsMap,
            },
        };
        document.dispatchEvent(new CustomEvent(QUERY_RESULT, eventData));
    });
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
        const spotlitElementWindow = spotlitElement.ownerDocument.defaultView;

        const domRect = spotlitElement.getBoundingClientRect();
        let topOffset = domRect.top;
        let leftOffset = domRect.left;

        if (window !== spotlitElementWindow) {
            const iframeBoundingRect = spotlitElementWindow.frameElement.getBoundingClientRect();
            topOffset += iframeBoundingRect.top;
            leftOffset += iframeBoundingRect.left;
        }

        spotlight.updateSpotlight(
            spotlitElement.localName,
            {
                x: leftOffset,
                y: topOffset,
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
    if (selectedElement !== window[SELECTED_ELEMENT]) {
        // If wasn't re-select
        window[SELECTED_ELEMENT] = selectedElement;
        handleSelectMutationObservers(selectedElement);
        spyEvents(selectedElement, eventData.events);
    }

    const elementProperties = parseElementProperties(selectedElement, eventData);
    const viableData = {};
    removeUnsendableObjects(viableData, elementProperties, eventData, viableData);

    const returnEventData = { detail: viableData };

    document.dispatchEvent(new CustomEvent(SELECT_RESULT, returnEventData));
}

/**
 * Removes some of the unwanted nasties we don't want to show in the
 * devtools and tries to parse a nice new object from the vals.
 * */
function removeUnsendableObjects(returnData, elementProperties, eventData, fullReturnData, cache = [], layer = 0) {
    if (layer > 25) {
        // Fallback to avoid stack overflow
        return;
    }
    for (const [key, val] of Object.entries(elementProperties)) {
        // Remove nodes, function and already cached object values (most likely circulars)
        if (val instanceof Node) {
            returnData[key] = buildNodeText(val);
            markFieldNoEdit(fullReturnData.properties, key);
            continue;
        }
        if (typeof val === 'function') {
            returnData[key] = buildFunctionText(val);
            markFieldNoEdit(fullReturnData.properties, key);
            continue;
        }
        if (isValidCacheHit(cache, key, val, eventData)) {
            returnData[key] = 'Circural';
            markFieldNoEdit(fullReturnData.properties, key);
            continue;
        }

        if (typeof val === 'object' && val != null) {
            cache.push(val);
            returnData[key] = Array.isArray(val) ? [...val] : { ...val };
            removeUnsendableObjects(returnData[key], val, eventData[key], fullReturnData, cache, layer + 1);
        } else {
            returnData[key] = val;
        }
    }
}

/**
 * A no-edit field is a property that should't be edited.
 *
 * These include e.g. Functions, Element references, circural deps etc.
 * */
function markFieldNoEdit(properties, fieldName) {
    if (!properties) return;
    const prop = properties.find(prop => prop.name === fieldName);
    if (!prop) return; // Only modify props
    prop.type = { text: 'no-edit' };
}

/**
 * If we already had the value from the eventdata, this means it's given to us by the CEM,
 * and we can trust that the property is fine. Otherwise we do a check if we've already gone through
 * this value to avoid circural deps
 *  */
function isValidCacheHit(cache, key, val, eventData) {
    return eventData[key] === 'undefined' && typeof val === 'object' && val != null && cache.includes(val);
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
${isValidCacheHit.toString()}
${castParameters.toString()}
${markFieldNoEdit.toString()}
`;
