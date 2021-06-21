import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";
import {
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    QUERY_REQUEST,
    QUERY_RESULT,
    SELECT_REQUEST,
    SELECT_RESULT,
    UPDATE_REQUEST,
} from "../crawler/crawler-constants.js";

let nydus;

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
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MESSAGE_TYPE.REFRESH) {
        chrome.runtime.sendMessage({ type: MESSAGE_TYPE.REFRESH, tabId: message.tabId });
    }
});

initNydus();

/**
 * @param {any} message
 */
function onNydusMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPE.LOG:
            if (typeof message.log === "object") console.log("", message.log);
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
            doSelect(message.index);
            break;
        case MESSAGE_TYPE.REFRESH:
            doRefresh(message.tabId);
            break;
        case MESSAGE_TYPE.UPDATE_PROPERTY:
            doPropertyUpdate(message);
            break;
        case MESSAGE_TYPE.INSPECT:
            doInspect();
            break;
    }
}

/**
 * @param {any} message
 * */
function doPropertyUpdate(message) {
    document.dispatchEvent(
        new CustomEvent(UPDATE_REQUEST, {
            detail: message,
        })
    );
}

function doInspect() {
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    document.dispatchEvent(new CustomEvent(INSPECT_REQUEST));

    selectResponse.then((res) => {
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
        tabId
    });
}

/**
 * @param {any} tabId
 */
function doRefresh(tabId) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
        tabId
    });
}

function doQuery() {
    const queryResponse = waitForDomMessageResponse(QUERY_RESULT);
    document.dispatchEvent(new CustomEvent(QUERY_REQUEST));

    queryResponse.then((res) => {
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
        })
    );
}

/**
 * @param {number} index
 */
function doSelect(index) {
    const selectResponse = waitForDomMessageResponse(SELECT_RESULT);
    document.dispatchEvent(
        new CustomEvent(SELECT_REQUEST, {
            detail: { index: index },
        })
    );
    selectResponse.then((res) => {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
            type: MESSAGE_TYPE.SELECT_RESULT,
            data: res.detail,
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
            (e) => {
                resolve(e);
            },
            { once: true }
        );
    });
}
