import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_TYPES } from "../types/connection-types.js";

/**
 * @type {chrome.runtime.Port} port
 * */
let port;

const bgInitPort = chrome.runtime.connect({ name: CONNECTION_TYPES.DEVTOOLS_BACKGROUND_CONTENT_INIT });
bgInitPort.onMessage.addListener(message => {
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            initialize();
            break;
        case MESSAGE_TYPE.REFRESH:
            doRefresh();
            break;
    }
});

function initialize() {
    port = chrome.runtime.connect({ name: CONNECTION_TYPES.DEVTOOLS_GENERAL });

    port.onMessage.addListener(function(message) {
        console.log("CONTENT MESSAGE", message);
        const tabId = port?.sender?.tab?.id;

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
            case MESSAGE_TYPE.HIGHLIGHT:
                doHighlight(message);
                break;
            case MESSAGE_TYPE.SELECT:
                doSelect(message.index);
                break;
            case MESSAGE_TYPE.PANEL_OPENED:
                // TODO(Matsuuu): Check if this can cause problems
                initialize();
                break;
            case MESSAGE_TYPE.REFRESH:
                doRefresh();
                break;
            case MESSAGE_TYPE.UPDATE_PROPERTY:
                doPropertyUpdate(message);
                break;
        }
    });

    console.log("Sending Init message ");
    port.postMessage({ type: MESSAGE_TYPE.INIT });
}

function doPropertyUpdate(message) {
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_UPDATE_PROPERTY", {
            detail: message,
        })
    );
}

function doOnPanelOpen() {
    port?.postMessage({ type: MESSAGE_TYPE.PANEL_OPENED });
}

function doRefresh() {
    console.log("REFRESH");
    port?.postMessage({ type: MESSAGE_TYPE.REFRESH });
}

function doQuery() {
    const queryResponse = waitForDomMessageResponse(
        "__WC_DEV_TOOLS_QUERY_RESULT"
    );
    document.dispatchEvent(new CustomEvent("__WC_DEV_TOOLS_QUERY_REQUEST"));

    queryResponse.then((res) => {
        console.log(res.detail);
        port?.postMessage({ type: MESSAGE_TYPE.QUERY_RESULT, data: res.detail });
    });
}

/**
 * @param {{ index: any; }} message
 */
function doHighlight(message) {
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_HIGHLIGHT_ELEMENT", {
            detail: { index: message.index },
        })
    );
}

/**
 * @param {number} index
 */
function doSelect(index) {
    const selectResponse = waitForDomMessageResponse(
        "__WC_DEV_TOOLS_SELECT_RESULT"
    );
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_SELECT_REQUEST", {
            detail: { index: index },
        })
    );
    selectResponse.then((res) => {
        console.log(res);
        console.log(res.detail);
        port?.postMessage({ type: MESSAGE_TYPE.SELECT_RESULT, data: res.detail });
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
