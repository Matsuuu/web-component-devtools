import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus } from 'nydus';
import {
    DOM_DO_SELECT,
    DOM_EVENT_TRIGGERED,
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    MUTATOR_RE_QUERY,
    MUTATOR_RE_SELECT,
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
} from '../cem/custom-elements-manifest-parser.js';
import { analyzeAndUpdateElement } from '../cem/web-analyzer.js';
import { getBaseUrl } from '../cem/custom-elements-helpers.js';

let nydus;
/** @type ManifestData */
let customElementManifestData;

function setCustomElementManifestData(manifestData) {
    customElementManifestData = manifestData;
}

function getCustomElementManifestData() {
    const baseUrl = getBaseUrl();
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.MANIFEST_FETCH,
        baseUrl
    });
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

function initDomListener() {
    window.addEventListener('message', onDomMessage);
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
        getCustomElementManifestData();
    }
});

initNydus();
initDomListener();

/**
 * @param {any} message
 */
function onNydusMessage(message) {
    if (!customElementManifestData) {
        getCustomElementManifestData();
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
        case MESSAGE_TYPE.MANIFEST_FETCH:
            setCustomElementManifestData(message.manifest);
            break;
    }
}

function onDomMessage(message) {
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

function handleSelectResult(message) {
    const elementData = message.data.selectedElement;
    console.log("ELDATA", elementData);

    analyzeAndUpdateElement(elementData);
    cleanUpData(elementData);

    const eventData = elementData.wrappedJSObject ?? elementData;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.SELECT_RESULT,
        data: eventData,
    });
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
    window.postMessage({ messageType: INSPECT_REQUEST }, window.location.origin);
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
    /** @type DevToolsElement */
    let eventData = message;
    if (customElementManifestData && customElementManifestData[message.tagName]) {
        const manifestData = getElementDataFromCustomElementManifest(customElementManifestData, message.tagName);
        eventData = { ...eventData, ...manifestData };
    }

    window.postMessage({ ...eventData, messageType: SELECT_REQUEST }, window.location.origin);
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
