import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";

const ports = {};

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port?.sender?.tab?.id;
    if (tabId) {
        ports[tabId] = port;
    }
});
const nydus = buildNydus({
    requiredConnections: [CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT],
    onBuild: onNydusBuild,
});


/**
 * @param {Nydus} nydus
 */
function onNydusBuild(nydus) {
    nydus.addClientConnection(
        CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT,
        onNydusMessage
    );
}

function onNydusMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            doPanelOpenAction(message.tabId);
            break;
        case MESSAGE_TYPE.REFRESH:
            reloadExtension(message.tabId);
            break;
    }
}

function doPanelOpenAction(tabId) {
    ports[tabId]?.postMessage({ type: MESSAGE_TYPE.PANEL_OPENED });
}

function reloadExtension(tabId) {
    ports[tabId]?.postMessage({
        type: MESSAGE_TYPE.REFRESH,
    });
}
