import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus } from 'nydus';
import {
    DOM_CREATED_EVENT,
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    MUTATION_EVENT,
    QUERY_REQUEST,
    QUERY_RESULT,
    SELECT_REQUEST,
    SELECT_RESULT,
    UPDATE_ATTRIBUTE_REQUEST,
    UPDATE_PROPERTY_REQUEST,
} from '../crawler/crawler-constants.js';
import {
    cleanUpData,
    getElementDataFromCustomElementManifest,
    mapCustomElementManifestData,
} from '../cem/custom-elements-manifest-parser.js';

let nydus;
/** @type ManifestData */
let customElementManifestData;

async function loadCustomElementManifestData() {
    customElementManifestData = await mapCustomElementManifestData();
}

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

// This extra channel is used for when some of the sessions have
// expired, but others haven't. For example refreshing with devtools open
chrome.runtime.onMessage.addListener(message => {
    if (message.type === MESSAGE_TYPE.REFRESH) {
        chrome.runtime.sendMessage({
            type: MESSAGE_TYPE.REFRESH,
            tabId: message.tabId,
            doReSelect: message.doReSelect,
        });
        loadCustomElementManifestData();
    }
});

// This "channel" is used to communicate with dom events and their mutation observers
document.addEventListener(MUTATION_EVENT, (/** @type {CustomEvent} */ e) => {
    if (!nydus.ready) return;
    switch (e.detail.action) {
        case 'QUERY':
            doQuery();
            break;
        case 'RESELECT':
            doSelect(e.detail.target);
            break;
    }
});

// This "channel" is used to communicate with dom events and other interaction
document.addEventListener(DOM_CREATED_EVENT, (/** @type CustomEvent */ e) => {
    if (!nydus.ready) return;
    switch (e.detail.action) {
        case 'SELECT':
            doSelect(e.detail.target);
            break;
        case 'EVENT':
            triggerEvent(e.detail.eventData);
            break;
    }
});

initNydus();

/**
 * @param {any} message
 */
function onNydusMessage(message) {
    if (!customElementManifestData) {
        loadCustomElementManifestData();
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
    }
}

/**
 * @param {any} message
 */
function doCallFunction(message) {
    let manifestData = null;
    if (customElementManifestData && customElementManifestData[message.tagName]) {
        manifestData = getElementDataFromCustomElementManifest(customElementManifestData, message.tagName);
    }

    window.postMessage({ messageType: FUNCTION_CALL_REQUEST, ...message, manifestData }, window.location.origin);
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
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    window.postMessage({ messageType: INSPECT_REQUEST }, window.location.origin);

    selectResponse.then(res => {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
            type: MESSAGE_TYPE.SELECT_RESULT,
            data: res.detail,
        });
    });
}

/**
 * @param {any} tabId
 */
function doOnPanelOpen(tabId) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.PANEL_OPENED,
        tabId,
    });
}

/**
 * @param {any} tabId
 */
function doRefresh(tabId) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
        tabId,
    });
}

function doQuery() {
    const queryResponse = waitForDomMessageResponse(QUERY_RESULT);
    window.postMessage({ messageType: QUERY_REQUEST }, window.location.origin);

    queryResponse.then(res => {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
            type: MESSAGE_TYPE.QUERY_RESULT,
            data: res.detail,
        });
    });
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
function doSelect(message) {
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    /** @type DevToolsElement */
    let eventData = message;
    if (customElementManifestData && customElementManifestData[message.tagName]) {
        const manifestData = getElementDataFromCustomElementManifest(customElementManifestData, message.tagName);
        eventData = { ...eventData, ...manifestData };
    }

    window.postMessage({ ...eventData, messageType: SELECT_REQUEST }, window.location.origin);

    selectResponse.then(res => {
        /** @type DevToolsElement */
        const elementData = res.detail;
        cleanUpData(elementData);
        const eventData = elementData.wrappedJSObject ?? elementData;
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
            type: MESSAGE_TYPE.SELECT_RESULT,
            data: eventData,
        });
    });
}

function triggerEvent(eventData) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.TRIGGER_EVENT,
        eventData,
    });
}

/**
 * @param {string} eventName
 */
function waitForDomMessageResponse(eventName) {
    return new Promise((resolve, reject) => {
        document.addEventListener(
            eventName,
            e => {
                resolve(e);
            },
            { once: true },
        );
    });
}
