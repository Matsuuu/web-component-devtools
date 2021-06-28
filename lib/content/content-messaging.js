import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus, Nydus } from '../messaging/nydus.js';
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
import { mapCustomElementManifestData } from '../cem/custom-elements-manifest-parser.js';

let nydus;
let customElementManifestData;

loadCustomElementManifestData();

async function loadCustomElementManifestData() {
    customElementManifestData = await mapCustomElementManifestData();
}

function initNydus() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT,
                onMessage: onNydusMessage,
                host: false,
            },
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT,
                onMessage: onNydusMessage,
                host: true,
            },
        ],
    });
}

// This extra channel is used for when some of the sessions have
// expired, but others haven't. For example refreshing with devtools open
chrome.runtime.onMessage.addListener(message => {
    if (message.type === MESSAGE_TYPE.REFRESH) {
        chrome.runtime.sendMessage({ type: MESSAGE_TYPE.REFRESH, tabId: message.tabId });
        loadCustomElementManifestData();
    }
});

document.addEventListener(MUTATION_EVENT, (/** @type {CustomEvent} */ e) => {
    switch (e.detail.action) {
        case 'QUERY':
            doQuery();
            break;
        case 'RESELECT':
            doSelect(e.detail.target);
            break;
    }
});

document.addEventListener(DOM_CREATED_EVENT, (/** @type CustomEvent */ e) => {
    switch (e.detail.action) {
        case "SELECT":
            doSelect(e.detail.target);
            break;
    }
});

initNydus();

/**
 * @param {any} message
 */
function onNydusMessage(message) {
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
    document.dispatchEvent(
        new CustomEvent(FUNCTION_CALL_REQUEST, {
            detail: message,
        }),
    );
}

/**
 * @param {any} message
 * */
function doPropertyUpdate(message) {
    document.dispatchEvent(
        new CustomEvent(UPDATE_PROPERTY_REQUEST, {
            detail: message,
        }),
    );
}

/**
 * @param {any} message
 */
function doAttributeUpdate(message) {
    document.dispatchEvent(
        new CustomEvent(UPDATE_ATTRIBUTE_REQUEST, {
            detail: message,
        }),
    );
}

function doInspect() {
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    document.dispatchEvent(new CustomEvent(INSPECT_REQUEST));

    selectResponse.then(res => {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
            type: MESSAGE_TYPE.SELECT_RESULT,
            data: res.detail,
        });
    });
}

/**
 * @param {any} tabId
 */
function doOnPanelOpen(tabId) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
        type: MESSAGE_TYPE.PANEL_OPENED,
        tabId,
    });
}

/**
 * @param {any} tabId
 */
function doRefresh(tabId) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
        tabId,
    });
}

function doQuery() {
    const queryResponse = waitForDomMessageResponse(QUERY_RESULT);
    document.dispatchEvent(new CustomEvent(QUERY_REQUEST));

    queryResponse.then(res => {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
            type: MESSAGE_TYPE.QUERY_RESULT,
            data: res.detail,
        });
    });
}

/**
 * @param {{ index: any; }} message
 */
function doHighlight(message) {
    document.dispatchEvent(
        new CustomEvent(HIGHLIGHT_ELEMENT, {
            detail: { index: message.index },
        }),
    );
}

/**
 * @param {string} elementTagName
 */
function getCustomElementManifestData(elementTagName) {
    return customElementManifestData[elementTagName];
}

/**
 * @param {any} message
 */
function doSelect(message) {
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    /** @type DevToolsElement */
    let eventData = message;
    if (customElementManifestData[message.tagName]) {
        eventData = { ...eventData, ...customElementManifestData[message.tagName] };
    }
    document.dispatchEvent(
        new CustomEvent(SELECT_REQUEST, {
            detail: eventData,
        }),
    );

    selectResponse.then(res => {
        /** @type DevToolsElement */
        const elementData = res.detail;
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
            type: MESSAGE_TYPE.SELECT_RESULT,
            data: elementData,
        });
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
