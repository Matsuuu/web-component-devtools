import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus, Nydus } from 'nydus';
import {
    ANALYZE_REQUEST,
    ANALYZE_RESULT,
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
} from '../crawler/crawler-constants.js';
import { cleanUpData } from '../cem/custom-elements-manifest-parser.js';
import { analyzeAllScripts, analyzeAndUpdateElement } from '../cem/web-analyzer.js';

let devtoolsOpen = false;
/** @type Nydus */
let nydus;
let currentSelectedElementManifestData;

setTimeout(() => {
    if (nydus._getConnectionsFlat().length <= 0) {
        console.warn('[WebComponentDevTools]: Context reset. Reloading page to reload extension.');
        window.location.reload();
    }
}, 3000);

function initNydus() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT,
                onMessage: onNydusMessage,
                host: false,
            },
        ],
    });
}

function initDomListener() {
    window.addEventListener('message', onDomMessage);
}

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

export function init() {
    initDomListener();
    initNydus();
}

/**
 * @param {any} message
 */
function onNydusMessage(message) {
    if (!devtoolsOpen && message.type !== MESSAGE_TYPE.PANEL_OPENED && message.type !== MESSAGE_TYPE.REFRESH) {
        return;
    }

    switch (message.type) {
        case MESSAGE_TYPE.LOG:
            if (typeof message.log === 'object') console.log('', message.log);
            else console.log(message.log);
            break;
        case MESSAGE_TYPE.LOG_OBJECT:
            console.log(message.log, message.data);
            break;
        case MESSAGE_TYPE.QUERY:
            doQuery();
            break;
        case MESSAGE_TYPE.PANEL_OPENED:
            doOnPanelOpen(message.tabId);
            break;
        case MESSAGE_TYPE.PANEL_CLOSED:
            doOnPanelClosed(message.tabId);
            break;
        case MESSAGE_TYPE.HIGHLIGHT:
            doHighlight(message);
            break;
        case MESSAGE_TYPE.SELECT:
            doSelect(message);
            break;
        case MESSAGE_TYPE.REFRESH:
            doRefresh(message.tabId);
            break;
        case MESSAGE_TYPE.UPDATE_PROPERTY:
            doPropertyUpdate(message);
            break;
        case MESSAGE_TYPE.UPDATE_ATTRIBUTE:
            doAttributeUpdate(message);
            break;
        case MESSAGE_TYPE.INSPECT:
            doInspect();
            break;
        case MESSAGE_TYPE.CALL_FUNCTION:
            doCallFunction(message);
            break;
        case MESSAGE_TYPE.SCROLL_INTO_VIEW:
            doScrollIntoView(message);
            break;
    }
}

function onDomMessage(message) {
    if (!devtoolsOpen) return;

    switch (message.data.messageType) {
        case SELECT_RESULT:
            handleSelectResult(message);
            break;
        case QUERY_RESULT:
            nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
                type: MESSAGE_TYPE.QUERY_RESULT,
                data: message.data.queryData,
            });
            break;
        case DOM_EVENT_TRIGGERED:
            triggerEvent(message.data.eventData);
            break;
        case DOM_DO_SELECT:
            doSelect(message.data.target);
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
 * @param {any} message
 */
async function doSelect(message) {
    /** @type DevToolsElement */
    let eventData = message;
    const analyzedData = await doAnalyze(eventData);

    window.postMessage({ ...analyzedData, messageType: SELECT_REQUEST }, window.location.origin);
}

/**
 * Request the Custom Element Declaration from the DOM, and
 * run it through the CEM analyzer, providing us with the analyzer version of the component
 *
 * @param { DevToolsElement } eventData
 *
 * @returns {Promise<DevToolsElement>}
 * */
async function doAnalyze(eventData) {
    const declarationRequestResult = await sendDomMessageAndGetResult(ANALYZE_RESULT, {
        indexInDevTools: eventData.indexInDevTools,
        messageType: ANALYZE_REQUEST,
    });
    if (eventData.wrappedJSObject) {
        eventData = { ...eventData.wrappedJSObject };
    }

    eventData.declaration = declarationRequestResult.declarationString;

    const scriptTags = Array.from(document.querySelectorAll('script:not([web-component-devtools-script])'));
    const pageSources = scriptTags.map(scrip => scrip?.src).filter(src => src && src.trim().length > 0);
    const pageInlineSources = scriptTags.map(scrip => scrip.innerHTML).filter(src => src.trim().length > 0);
    const origin = window.location.origin;
    const tabId = nydus.nydusTab;

    // On Chrome, we send the data to background script and analyze them there to reduce clutter
    if (navigator.userAgent.includes('Chrome')) {
        const analysisResponse = await sendBackgroundMessageAndGetResult(MESSAGE_TYPE.ANALYZE_ELEMENT_RESULT, {
            type: MESSAGE_TYPE.ANALYZE_ELEMENT,
            eventData,
            pageSources,
            pageInlineSources,
            origin,
            tabId,
        });
        const analysisResult = analysisResponse.analysisResult;

        return analysisResult;
    } else {
        // For firefox, we need to do it in the content script due to CORS limitations
        await analyzeAllScripts(pageSources, pageInlineSources, origin, tabId);
        await analyzeAndUpdateElement(eventData, origin, tabId);
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
                window.removeEventListener('message', onResponse);
                resolve(event.data);
            }
        };
        window.addEventListener('message', onResponse);
        window.postMessage(body, window.location.origin);
    });
}

/**
 * A Promisified version of sending a message to background script via nydus, and getting the result back.
 * @param {number | string} resultType
 * @param {any} body
 */
function sendBackgroundMessageAndGetResult(resultType, body) {
    return new Promise(resolve => {
        /** @type import('nydus').NydusConnection */
        const connection = nydus
            ._getConnectionsFlat()
            .find(con => con.id === CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT);

        const onResponse = async (/** @type { any } */ message) => {
            if (message.type === resultType) {
                window.removeEventListener('message', onResponse);
                connection.connection.onMessage.removeListener(onResponse);
                resolve(message);
            }
        };

        if (connection) {
            connection.connection.onMessage.addListener(onResponse);
            nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, body);
        }
    });
}

function handleSelectResult(message) {
    const elementData = message.data.selectedElement;

    cleanUpData(elementData);

    const events = elementData?.wrappedJSObject?.events ?? elementData.events;
    doStartSpyEvents({ events });

    const eventData = elementData.wrappedJSObject ?? elementData;

    currentSelectedElementManifestData = eventData;

    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.SELECT_RESULT,
        data: eventData,
    });
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

/**
 * @param {any} message
 * */
function doPropertyUpdate(message) {
    window.postMessage({ messageType: UPDATE_PROPERTY_REQUEST, ...message }, window.location.origin);
}

/**
 * @param {any} message
 */
function doAttributeUpdate(message) {
    window.postMessage({ messageType: UPDATE_ATTRIBUTE_REQUEST, ...message }, window.location.origin);
}

function doInspect() {
    window.postMessage({ messageType: INSPECT_REQUEST }, window.location.origin);
}

/**
 * @param {any} tabId
 */
function doOnPanelOpen(tabId) {
    devtoolsOpen = true;
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
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
        tabId,
    });
    doQuery();
}

function doQuery() {
    window.postMessage({ messageType: QUERY_REQUEST }, window.location.origin);
}

/**
 * @param {{ index: any; }} message
 */
function doHighlight(message) {
    window.postMessage({ messageType: HIGHLIGHT_ELEMENT, index: message.index }, window.location.origin);
}

/**
 * @param {any} message
 */
function doScrollIntoView(message) {
    window.postMessage({ messageType: SCROLL_INTO_VIEW, index: message.index }, window.location.origin);
}

function triggerEvent(eventData) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.TRIGGER_EVENT,
        eventData,
    });
}
