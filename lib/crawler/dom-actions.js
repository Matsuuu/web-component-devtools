import { SpotlightBorder } from "./spotlight-border.js";
import {
    ANALYZE_RESULT,
    CONSOLE_ACTION_RESULT,
    CONTEXT_MENU_TARGET,
    DOM_DO_SELECT,
    QUERY_RESULT,
    SELECTED_ELEMENT,
    SELECT_RESULT,
    SPOTLIGHT_ELEMENT,
} from "./crawler-constants.js";
import {
    buildFunctionText,
    buildNodeText,
    getCurrentSelectedElement,
    getElementDeclaration,
    throttle,
} from "./crawler-utils.js";
import { findElementsOnPage, getCachedFoundElements, getElementById } from "./element-finder";
import { parseElementProperties } from "./element-parser.js";
import { getElementTypeById } from "./element-types";
import { spyEvents } from "./event-observer.js";
import { handleSelectMutationObservers } from "./mutation-observer.js";

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
    const targetElement = getCurrentSelectedElement();
    const methodDescription = data.manifestData.methods.find(meth => meth.name === method.name);
    const params = castParameters(data.parameters, methodDescription);

    let res;
    if (method.parameters) {
        res = targetElement[method.name].call(targetElement, ...params);
    } else {
        res = targetElement[method.name].call(targetElement);
    }
    console.log("[WebComponentDevTools]: Function call return value: ", res);
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
            case "number":
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
        // @ts-ignore For now
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
                elementsTree: parsedElements.toMessageFormat(),
            },
        };

        console.log("Elements queried");
        window.postMessage({ messageType: QUERY_RESULT, ...eventData }, window.location.origin);
    });
}

/**
 * @param {import("./element-updaters.js").UpdateData} updateData
 */
export function updateElementProperty(updateData) {
    const elementType = getElementTypeById(updateData.elementType);
    elementType.onUpdate(updateData, "property");
}

/**
 * @param {import('./element-updaters.js').UpdateData} updateData
 */
export function updateElementAttribute(updateData) {
    const elementType = getElementTypeById(updateData.elementType);
    elementType.onUpdate(updateData, "attribute");
}

/**
 * @param {Number} id
 */
export function highlightElement(id) {
    /** @type {import("./spotlight-border.js").SpotlightBorder} */
    let spotlight = window[SPOTLIGHT_ELEMENT];
    if (!spotlight) {
        spotlight =
            /** @type {import("./spotlight-border.js").SpotlightBorder} */
            (document.createElement("wc-devtools-spotlight-border"));

        SpotlightBorder.init();
        document.body.appendChild(spotlight);
        window[SPOTLIGHT_ELEMENT] = spotlight;
    }

    if (id >= 0) {
        spotlight.style.visibility = "visible";
        const spotlitElement = getElementById(id);

        spotlight.spotlight(spotlitElement);
    } else {
        // If the element wants to highlight "-1", it means "Turn off the highlight"
        spotlight.updateSpotlight("", undefined, { x: 0, y: 0 });
        spotlight.style.visibility = "hidden";
    }
}

/**
 * Selects the given element by index and returns the property values of the element
 * @param {any} eventData
 */
export function selectElement(eventData) {
    const selectedElement = getElementById(eventData.node.id);
    if (!selectedElement) {
        return;
    }

    if (selectedElement !== getCurrentSelectedElement()) {
        if (!selectedElement) {
            debugger;
        }
        // If wasn't re-select
        window[SELECTED_ELEMENT] = selectedElement;
        handleSelectMutationObservers(selectedElement);
    }

    const elementProperties = parseElementProperties(selectedElement, eventData);
    const viableData = {};

    removeUnsendableObjects(viableData, elementProperties, eventData, viableData);

    const returnEventData = { selectedElement: viableData };

    cleanUp(returnEventData);
    if (JSON.stringify(returnEventData).includes("__WC_CACHE_KEY")) {
        debugger;
    }
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
    if (!fields) return [];
    return fields.sort((a, b) => {
        if (!b.static && a.static) return 1;
        if (b.static && !a.static) return -1;
        if (a.static && b.inheritedFrom) return 1;
        if (b.inheritedFrom && !a.inheritedFrom) return -1;
        if (a.inheritedFrom && !b.inheritedFrom) return 1;
        if (!a.name?.startsWith("_") && b.name?.startsWith("_")) return -1;
        if (a.name?.startsWith("_") && !b.name?.startsWith("_")) return 1;
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
    const selectedElement = getElementById(eventData.id);
    selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

export async function analyzeElement(eventData) {
    const element = getElementById(eventData.id);
    let declaration = getElementDeclaration(element);
    const declarationString = "export " + declaration.toString();

    window.postMessage({ messageType: ANALYZE_RESULT, declarationString }, window.location.origin);
}

export async function consoleAction(eventData) {
    let code = eventData.code;
    code = code.replaceAll("$0", "this");
    const context = getCurrentSelectedElement();
    let returnValue;
    let error = null;
    let errorID = null;

    try {
        const newFunc = new Function(`return ${code}`);
        returnValue = newFunc.call(context);
    } catch (err) {
        returnValue = "";
        error = err.toString();
        errorID = "_ERR_RUNTIME";
    }

    if (returnValue instanceof Node || returnValue instanceof Element) {
        error =
            'Value was of type "Node", and could only be passed back as a stringified representation. Click here to print the actual result into the DevTools console.';
        errorID = "_ERR_IS_NODE";
        returnValue = buildNodeText(returnValue);
    }
    if (typeof returnValue === "function") {
        error =
            'Value was of type "Function", and could only be passed back as a stringified representation. Click here to print the actual result into the DevTools console.';
        errorID = "_ERR_IS_FUNCTION";
        returnValue = buildFunctionText(returnValue.toString());
    }

    try {
        cleanUp(returnValue);
        window.postMessage(
            { messageType: CONSOLE_ACTION_RESULT, returnValue, error, errorID, code },
            window.location.origin,
        );
    } catch (err) {
        // If we fail at sending the result, it's most likely due to it being a
        // object that is not sendable (similair to in select event).
        //
        // We then strip the unsendable objects.
        const viableData = {};
        removeUnsendableObjects(viableData, returnValue, eventData, viableData, false);
        cleanUp(returnValue);
        window.postMessage(
            { messageType: CONSOLE_ACTION_RESULT, returnValue: viableData, error, errorID, code },
            window.location.origin,
        );
    }
}

/**
 * We initialize all sorts of stuff into our properties while
 * working on them. Let's clean up after ourselves
 * @param {any[] | {}} objectOrProps
 */
function cleanUp(objectOrProps) {
    let properties = Array.isArray(objectOrProps) ? objectOrProps : Object.values({ objectOrProps });
    for (const prop of properties) {
        if (prop != null && typeof prop === "object") {
            if (prop.__WC_CACHE_KEY) {
                delete prop.__WC_CACHE_KEY;
            }
            cleanUp(Object.values(prop));
        }
    }
}

/**
 * Removes some of the unwanted nasties we don't want to show in the
 * devtools and tries to parse a nice new object from the vals.
 *
 * TODO: The array/object separation should be looked at. It seems to return objects
 * when iterating arrays. Also this is growing a bit larger than need be
 * */
function removeUnsendableObjects(
    returnData,
    elementProperties,
    eventData,
    fullReturnData,
    addNoEditTags = true,
    cache = [],
    layer = 0,
) {
    for (const [key, val] of Object.entries(elementProperties)) {
        if (layer > 25) {
            returnData[key] = addNoEditTags ? "#NO_EDIT#Analysis Depth Reached" : "";
            // Fallback to avoid stack overflow
            console.warn(
                "[WebComponentDevTools]: Your element had a really deep object structure. We cut it down to the first 25 layers to improve performance.",
            );
            continue;
        }
        if (isValidCacheHit(cache, key, val, eventData)) {
            returnData[key] = addNoEditTags ? "#NO_EDIT#Circural" : "";
            continue;
        }
        if (typeof val === "symbol") {
            returnData[key] = (addNoEditTags ? "#NO_EDIT#" : "") + val.toString();
            continue;
        }
        // Remove nodes, function and already cached object values (most likely circulars)
        if (val instanceof Node) {
            returnData[key] = (addNoEditTags ? "#NO_EDIT#" : "") + buildNodeText(val);
            continue;
        }
        if (typeof val === "function") {
            returnData[key] = (addNoEditTags ? "#NO_EDIT#" : "") + buildFunctionText(val.toString());
            continue;
        }

        if (typeof val === "object" && val != null) {
            addFieldToCache(key, val, cache);
            returnData[key] = Array.isArray(val) ? [...val] : { ...val };
            removeUnsendableObjects(
                returnData[key],
                val,
                eventData[key],
                fullReturnData,
                addNoEditTags,
                cache,
                layer + 1,
            );
        } else {
            if (typeof val === "string" && val.length > 10000) {
                returnData[key] = "PARTIAL VIEW ... " + val;
            } else {
                returnData[key] = val;
            }
        }
    }
}

function addFieldToCache(key, val, cache) {
    try {
        val.__WC_CACHE_KEY = key;
        cache.push(val);
    } catch (err) {
        //
    }
}

/**
 * If we already had the value from the eventdata, this means it's given to us by the CEM,
 * and we can trust that the property is fine. Otherwise we do a check if we've already gone through
 * this value to avoid circural deps
 *  */
function isValidCacheHit(cache, key, val, eventData) {
    //return eventData[key] === 'undefined' && typeof val === 'object' && val != null && cache.includes(val);
    return typeof val === "object" && val != null && cache.includes(val) && val.__WC_CACHE_KEY === key;
}
