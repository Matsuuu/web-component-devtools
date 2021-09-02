import { SpotlightBorder } from '../elements/spotlight-border.js';
import {
    ANALYZE_RESULT,
    CONTEXT_MENU_TARGET,
    DOM_DO_SELECT,
    QUERY_RESULT,
    SELECTED_ELEMENT,
    SELECT_RESULT,
    SPOTLIGHT_ELEMENT,
} from './crawler-constants.js';
import {
    buildFunctionText,
    buildNodeText,
    getCurrentSelectedElement,
    getElementDeclaration,
    throttle,
} from './crawler-utils.js';
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

export function callFunction(data) {
    const method = data.method;
    const targetElement = getElementByIndex(data.targetIndex);
    const methodDescription = data.manifestData.methods.find(meth => meth.name === method.name);
    const params = castParameters(data.parameters, methodDescription);

    let res;
    if (method.parameters) {
        res = targetElement[method.name].call(targetElement, ...params);
    } else {
        res = targetElement[method.name].call(targetElement);
    }
    console.log('[WebComponentDevTools]: Function call return value: ', res);
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
            messageType: DOM_DO_SELECT,
            target: {
                indexInDevTools: elementToInspect.index,
                name: elementToInspect.element.nodeName.toLowerCase(),
                tagName: elementToInspect.element.nodeName.toLowerCase(),
            },
        };
        window.postMessage(eventData, window.location.origin);
    }
}

export function queryElements() {
    throttle(() => {
        const parsedElements = findElementsOnPage();

        const eventData = {
            queryData: {
                elementsArray: parsedElements.elementsArray,
                elementsMap: parsedElements.elementsMap,
            },
        };
        window.postMessage({ messageType: QUERY_RESULT, ...eventData }, window.location.origin);
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
    if (selectedElement !== getCurrentSelectedElement()) {
        // If wasn't re-select
        window[SELECTED_ELEMENT] = selectedElement;
        handleSelectMutationObservers(selectedElement);
    }

    const elementProperties = parseElementProperties(selectedElement, eventData);
    const viableData = {};
    removeUnsendableObjects(viableData, elementProperties, eventData, viableData);

    const returnEventData = { selectedElement: viableData };

    cleanUp(Object.values(returnEventData));
    sortComponentData(returnEventData.selectedElement);

    window.postMessage({ messageType: SELECT_RESULT, ...returnEventData }, window.location.origin);
}

function sortComponentData(componentData) {
    componentData.properties = sortFields(componentData.properties);
    componentData.attributes = sortFields(componentData.attributes);
    componentData.events = sortFields(componentData.events);
    componentData.methods = sortFields(componentData.methods);
}

function sortFields(fields) {
    return fields.sort((a, b) => {
        if (!b.static && a.static) return 1;
        if (b.static && !a.static) return -1;
        if (a.static && b.inheritedFrom) return 1;
        if (b.inheritedFrom && !a.inheritedFrom) return -1;
        if (a.inheritedFrom && !b.inheritedFrom) return 1;
        if (!a.name.startsWith("_") && b.name.startsWith("_")) return -1;
        if (a.name.startsWith("_") && !b.name.startsWith("_")) return 1;
        if (a.name < b.name) return -1;
        if (b.name > b.name) return 1;
        return 0;
    });
}

export function startSpyEvents(eventData) {
    const selectedElement = getCurrentSelectedElement();
    spyEvents(selectedElement, eventData.events);
}

export function scrollIntoView(eventData) {
    const selectedElement = getElementByIndex(eventData.index);
    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function analyzeElement(eventData) {
    const element = getElementByIndex(eventData.indexInDevTools);
    const declaration = getElementDeclaration(element);
    const declarationString = 'export ' + declaration.toString();

    window.postMessage({ messageType: ANALYZE_RESULT, declarationString }, window.location.origin);
}

/**
 * We initialize all sorts of stuff into our properties while
 * working on them. Let's clean up after ourselves
 * */
function cleanUp(props) {
    for (const prop of props) {
        if (prop != null && typeof prop === 'object') {
            delete prop.__WC_CACHE_KEY;
            cleanUp(Object.values(prop));
        }
    }
}

/**
 * Removes some of the unwanted nasties we don't want to show in the
 * devtools and tries to parse a nice new object from the vals.
 * */
function removeUnsendableObjects(returnData, elementProperties, eventData, fullReturnData, cache = [], layer = 0) {
    if (layer > 25) {
        // Fallback to avoid stack overflow
        console.warn(
            '[WebComponentDevTools]: Your element had a really deep object structure. We cut it down to the first 25 layers to improve performance.',
        );
        return;
    }
    for (const [key, val] of Object.entries(elementProperties)) {
        // Remove nodes, function and already cached object values (most likely circulars)
        if (val instanceof Node) {
            returnData[key] = '#NO_EDIT#' + buildNodeText(val);
            continue;
        }
        if (typeof val === 'function') {
            returnData[key] = '#NO_EDIT#' + buildFunctionText(val);
            continue;
        }
        if (isValidCacheHit(cache, key, val, eventData)) {
            returnData[key] = '#NO_EDIT#Circural';
            continue;
        }

        if (typeof val === 'object' && val != null) {
            addFieldToCache(key, val, cache);
            returnData[key] = Array.isArray(val) ? [...val] : { ...val };
            removeUnsendableObjects(returnData[key], val, eventData[key], fullReturnData, cache, layer + 1);
        } else {
            returnData[key] = val;
        }
    }
}

function addFieldToCache(key, val, cache) {
    val.__WC_CACHE_KEY = key;
    cache.push(val);
}

/**
 * If we already had the value from the eventdata, this means it's given to us by the CEM,
 * and we can trust that the property is fine. Otherwise we do a check if we've already gone through
 * this value to avoid circural deps
 *  */
function isValidCacheHit(cache, key, val, eventData) {
    //return eventData[key] === 'undefined' && typeof val === 'object' && val != null && cache.includes(val);
    return typeof val === 'object' && val != null && cache.includes(val) && val.__WC_CACHE_KEY === key;
}

export const domActionsInject = `
${addFieldToCache.toString()}
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
${startSpyEvents.toString()}
${scrollIntoView.toString()}
${analyzeElement.toString()}
${cleanUp.toString()}
${sortComponentData.toString()}
${sortFields.toString()}
`;
