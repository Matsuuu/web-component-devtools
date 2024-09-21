import {
    AnalyzeElementMessage,
    AnalyzeElementResultMessage,
    CallFunctionMessage,
    ConsoleActionMessage,
    HighlightMessage,
    MESSAGE_TYPE,
    QueryMessage,
    QueryResultMessage,
    RefreshMessage,
    ScrollIntoViewMessage,
    SelectMessage,
    SelectResultMessage,
    UpdateAttributeMessage,
    UpdatePropertyMessage,
} from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "nydus";
import {
    ANALYZE_REQUEST,
    ANALYZE_RESULT,
    CONSOLE_ACTION,
    CONSOLE_ACTION_RESULT,
    DOM_DO_SELECT,
    DOM_EVENT_TRIGGERED,
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    MUTATOR_RE_QUERY,
    MUTATOR_RE_SELECT,
    QUERY_REQUEST,
    QUERY_RESULT,
    SCROLL_INTO_VIEW,
    SELECT_REQUEST,
    SELECT_RESULT,
    START_SPY_EVENTS,
    UPDATE_ATTRIBUTE_REQUEST,
    UPDATE_PROPERTY_REQUEST,
} from "../crawler/crawler-constants.js";
import { cleanUpData } from "../util/property-cleaning.js";
import { devToolsElementFromNode } from "../types/devtools-element.js";
import {
    CONNECTION_HOSTS,
    connectToRouter,
    messageIs,
    PingMessage,
    PongMessage,
    sendMessage,
    sendMessageAndAwaitResponse,
} from "../messaging/messaging.js";

let devtoolsOpen = false;
/** @type Nydus */
let nydus;
let currentSelectedElementManifestData;
let currentTarget;
let reselectTarget;

connectToRouter(CONNECTION_HOSTS.CONTENT, onMessage);
setTimeout(() => {
    // sendMessage(CONNECTION_HOSTS.DEVTOOLS, new PingMessage());
}, 5000);

function initDomListener() {
    window.addEventListener("message", onDomMessage);
}

export function init() {
    initDomListener();

    // This extra channel is used for when some of the sessions have
    // expired, but others haven't. For example refreshing with devtools open
    chrome.runtime.onMessage.addListener(message => {
        if (message.type === MESSAGE_TYPE.REFRESH && devtoolsOpen) {
            chrome.runtime.sendMessage({
                type: MESSAGE_TYPE.REFRESH,
                tabId: message.tabId,
                doReSelect: message.doReSelect,
            });
        }
    });
}

/**
 * @param {any} message
 * @param {chrome.runtime.Port} port
 */
function onMessage(message, port) {
    console.log("[CONTENT]: onMessage: ", message);
    if (messageIs(message, PongMessage)) {
        setTimeout(() => {
            console.log("Pong");
            sendMessage(CONNECTION_HOSTS.DEVTOOLS, new PingMessage());
        }, 1000);
    }

    if (messageIs(message, QueryMessage)) {
        return doQuery();
    }
    if (messageIs(message, HighlightMessage)) {
        return doHighlight(new HighlightMessage(message));
    }
    if (messageIs(message, SelectMessage)) {
        return doSelect(new SelectMessage(message));
    }
    if (messageIs(message, AnalyzeElementResultMessage)) {
        return handleAnalyzeResult(new AnalyzeElementResultMessage(message));
    }
    if (messageIs(message, UpdatePropertyMessage)) {
        return doUpdateProperty(new UpdatePropertyMessage(message));
    }
    if (messageIs(message, UpdateAttributeMessage)) {
        return doUpdateAttribute(new UpdateAttributeMessage(message));
    }
    if (messageIs(message, ScrollIntoViewMessage)) {
        return doScrollIntoView(message);
    }
    if (messageIs(message, RefreshMessage)) {
        doRefresh(message.tabId);
        if (message.doReSelect) {
            reselectTarget = message.latestSelect;
        }
    }
    if (messageIs(message, CallFunctionMessage)) {
        doCallFunction(message);
    }
    if (messageIs(message, ConsoleActionMessage)) {
        doConsoleAction(message);
    }
}

function onDomMessage(message) {
    switch (message.data.messageType) {
        case SELECT_RESULT:
            handleSelectResult(message);
            break;
        case QUERY_RESULT:
            sendMessage(CONNECTION_HOSTS.DEVTOOLS, new QueryResultMessage(message.data.queryData, reselectTarget));
            reselectTarget = null;
            break;
        case DOM_EVENT_TRIGGERED:
            triggerEvent(message.data.eventData);
            break;
        case DOM_DO_SELECT:
            doSelect(message.data.target, true);
            break;
        case MUTATOR_RE_QUERY:
            doQuery();
            break;
        case MUTATOR_RE_SELECT:
            doSelect(message.data.target);
            break;
    }
}

/**
 * @param {SelectMessage} message
 * @param {boolean} scrollToTargetInDevTools
 */
async function doSelect(message, scrollToTargetInDevTools = false) {
    /** @type {import('../types/devtools-element.js').DevToolsElement} */
    if (!message.node.id) {
        debugger;
    }

    let eventData = devToolsElementFromNode(message.node);
    currentTarget = eventData;
    const analyzedData = await doAnalyze(eventData);

    sendMessage(CONNECTION_HOSTS.BACKGROUND, new SelectMessage(eventData));
    // nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, { type: MESSAGE_TYPE.SELECT, eventData });
    window.postMessage(
        { ...analyzedData, messageType: SELECT_REQUEST, scrollToTargetInDevTools },
        window.location.origin,
    );
}

/**
 * Request the Custom Element Declaration from the DOM, and
 * run it through the CEM analyzer, providing us with the analyzer version of the component
 *
 * @param {import('../types/devtools-element.js').DevToolsElement} eventData
 *
 * @returns {Promise<import('../types/devtools-element.js').DevToolsElement>}
 * */
async function doAnalyze(eventData) {
    const declarationRequestResult = await sendDomMessageAndGetResult(ANALYZE_RESULT, {
        id: eventData.node.id,
        tagName: eventData.tagName,
        messageType: ANALYZE_REQUEST,
    });
    /*if (eventData.wrappedJSObject) {
        eventData = { ...eventData.wrappedJSObject };
    }*/ // TODO: Need this anymore?

    eventData.declaration = declarationRequestResult.declarationString;

    const scriptTags = Array.from(document.querySelectorAll("script:not([web-component-devtools-script])"));
    // @ts-ignore
    const pageSources = scriptTags.map(scrip => scrip?.src).filter(src => src && src.trim().length > 0);
    const pageInlineSources = scriptTags.map(scrip => scrip.innerHTML).filter(src => src.trim().length > 0);
    const origin = window.location.origin;
    const fullPath = window.location.href;

    // On Chrome, we send the data to background script and analyze them there to reduce clutter
    if (navigator.userAgent.includes("Chrome")) {
        const analyzeMessage = new AnalyzeElementMessage({
            type: MESSAGE_TYPE.ANALYZE_ELEMENT,
            eventData,
            pageSources,
            pageInlineSources,
            origin,
            fullPath,
        });
        const analysisResponse = await sendMessageAndAwaitResponse(
            CONNECTION_HOSTS.BACKGROUND,
            analyzeMessage,
            AnalyzeElementResultMessage,
        );

        const analysisResult = analysisResponse.analysisResult;

        return analysisResult;
    } else {
        // For firefox, we need to do it in the content script due to CORS limitations
        // TODO: Test out this stuff in firefox with v3
        //await analyzeAllScripts(pageSources, pageInlineSources, origin, fullPath, tabId);
        //await analyzeAndUpdateElement(eventData, origin, tabId);
        return eventData;
    }
}

/**
 * A Promisified version of sending a message to DOM actions, and getting the result back.
 * @param {string} resultType
 * @param {any} body
 */
function sendDomMessageAndGetResult(resultType, body) {
    return new Promise(resolve => {
        const onResponse = async (/** @type { MessageEvent } */ event) => {
            if (event.data.messageType === resultType) {
                window.removeEventListener("message", onResponse);
                resolve(event.data);
            }
        };
        window.addEventListener("message", onResponse);
        window.postMessage(body, window.location.origin);
    });
}

function handleSelectResult(message) {
    const elementData = message.data.selectedElement;

    cleanUpData(elementData);

    const events = elementData?.wrappedJSObject?.events ?? elementData.events;
    doStartSpyEvents({ events });

    const eventData = elementData.wrappedJSObject ?? elementData;

    currentSelectedElementManifestData = eventData;

    sendMessage(CONNECTION_HOSTS.DEVTOOLS, new SelectResultMessage(eventData));
}

/**
 * @param {any} message
 */
function doCallFunction(message) {
    const manifestData = currentSelectedElementManifestData;
    window.postMessage({ messageType: FUNCTION_CALL_REQUEST, ...message, manifestData }, window.location.origin);
}

function doStartSpyEvents(message) {
    window.postMessage({ messageType: START_SPY_EVENTS, ...message }, window.location.origin);
}

function doInspect() {
    window.postMessage({ messageType: INSPECT_REQUEST }, window.location.origin);
}

/**
 * @param {any} tabId
 */
function doOnPanelOpen(tabId) {
    devtoolsOpen = true;
    if (currentTarget) {
        reselectTarget = currentTarget;
    }
    doRefresh(tabId);
}

/**
 * @param {any} tabId
 */
function doOnPanelClosed(tabId) {
    devtoolsOpen = false;
}

/**
 * @param {any} tabId
 */
function doRefresh(tabId) {
    devtoolsOpen = true;
    doQuery();
}

function doQuery() {
    window.postMessage({ messageType: QUERY_REQUEST }, window.location.origin);
}

/**
 * @param {{ id: number; }} message
 */
function doHighlight(message) {
    window.postMessage({ messageType: HIGHLIGHT_ELEMENT, id: message.id }, window.location.origin);
}

/**
 * @param {any} message
 */
function doScrollIntoView(message) {
    window.postMessage({ messageType: SCROLL_INTO_VIEW, id: message.id }, window.location.origin);
}

function triggerEvent(eventData) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.TRIGGER_EVENT,
        eventData,
    });
}

async function doConsoleAction(message) {
    const consoleActionResult = await sendDomMessageAndGetResult(CONSOLE_ACTION_RESULT, {
        messageType: CONSOLE_ACTION,
        code: message.code,
    });
    const returnValue = consoleActionResult.returnValue;
    const error = consoleActionResult.error;
    const errorID = consoleActionResult.errorID;
    const code = consoleActionResult.code;
    const eventData = { returnValue, error, errorID, code };

    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.CONSOLE_ACTION_RESULT,
        eventData,
    });
}

function handleAnalyzeResult(message) {
    window.postMessage(
        { ...message, messageType: SELECT_REQUEST, scrollToTargetInDevTools: false /* TODO */ },
        window.location.origin,
    );
}

function doUpdateProperty(message) {
    window.postMessage({ messageType: UPDATE_PROPERTY_REQUEST, ...message }, window.location.origin);
}

function doUpdateAttribute(message) {
    window.postMessage({ messageType: UPDATE_ATTRIBUTE_REQUEST, ...message }, window.location.origin);
}
