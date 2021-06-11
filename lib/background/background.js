import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus } from "../messaging/nydus.js";

const ports = {};

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port?.sender?.tab?.id;
    if (tabId) {
        ports[tabId] = port;
    }

    if (port.name === CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER) {
        initializeContentScript(port);
    }
});

async function initializeContentScript(initializerPort) {
    initializerPort.onMessage.addListener((message) => {
        switch (message.type) {
            case MESSAGE_TYPE.PANEL_OPENED:
                doPanelOpenAction(message.tabId);
                break;
            case MESSAGE_TYPE.REFRESH:
                reloadExtension(message.tabId);
                break;
        }
    });
}

function doPanelOpenAction(tabId) {

    ports[tabId]?.postMessage({ type: MESSAGE_TYPE.PANEL_OPENED });
}

function reloadExtension(tabId) {
    ports[tabId]?.postMessage({
        type: MESSAGE_TYPE.REFRESH,
    });
}
