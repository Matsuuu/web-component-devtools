import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";

const nydus = buildNydus({
    requiredConnections: [CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT],
    onBuild: onNydusBuild,
    onReady: onNydusReady,
});

/**
 * @param {Nydus} nydus
 */
function onNydusBuild(nydus) {
    nydus.addClientConnection(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, onNydusMessage);
    nydus.addHostConnection(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, onNydusMessage);
}

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    console.log("Communication with Devtools Panel & Background initialized", nydus);
}

function onNydusMessage(message) {
    console.log("ON MESSAGE", message);
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
        case MESSAGE_TYPE.REFRESH:
            doRefresh();
            break;
        case MESSAGE_TYPE.UPDATE_PROPERTY:
            doPropertyUpdate(message);
            break;
    }
}

function doPropertyUpdate(message) {
    document.dispatchEvent(
        new CustomEvent("__WC_DEV_TOOLS_UPDATE_PROPERTY", {
            detail: message,
        })
    );
}

function doOnPanelOpen() {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, { type: MESSAGE_TYPE.PANEL_OPENED });
}

function doRefresh() {
    console.log("REFRESH");
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, { type: MESSAGE_TYPE.REFRESH });
}

function doQuery() {
    const queryResponse = waitForDomMessageResponse(
        "__WC_DEV_TOOLS_QUERY_RESULT"
    );
    document.dispatchEvent(new CustomEvent("__WC_DEV_TOOLS_QUERY_REQUEST"));

    queryResponse.then((res) => {
        console.log(res.detail);
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, { type: MESSAGE_TYPE.QUERY_RESULT, data: res.detail });
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
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, { type: MESSAGE_TYPE.SELECT_RESULT, data: res.detail });
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
