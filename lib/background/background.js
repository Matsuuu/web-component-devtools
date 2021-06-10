import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_TYPES } from "../types/connection-types.js";
import { buildNydus } from "../messaging/nydus.js";

const ports = {};

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port?.sender?.tab?.id;
    if (tabId) {
        ports[tabId] = port;
    }

    if (port.name === CONNECTION_TYPES.DEVTOOLS_INITIALIZER) {
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

    const nydus = buildNydus({
        requiredConnections: [CONNECTION_TYPES.DEVTOOLS_BACKGROUND_CONTENT_INIT],
        onBuild: onNydusBuild,
        onReady: onNydusReady
    });

    /**
     * @param {Nydus} nydus
     */
    function onNydusBuild(nydus) {
        console.log("On nydus build");
        nydus.addConnection(CONNECTION_TYPES.DEVTOOLS_BACKGROUND_CONTENT_INIT);
    }

    function onNydusReady(nydus) {
        console.log("Communication with content script initialized", nydus);
    }


    ports[tabId]?.postMessage({ type: MESSAGE_TYPE.PANEL_OPENED });
}

function reloadExtension(tabId) {
    ports[tabId]?.postMessage({
        type: MESSAGE_TYPE.REFRESH,
    });
}
