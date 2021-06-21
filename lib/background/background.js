import { MESSAGE_TYPE } from "../types/message-types.js";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";

const nydus = buildNydus({
    requiredConnections: [
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT,
            host: false,
            onMessage: onNydusMessage,
        },
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER,
            host: false,
            onMessage: onNydusMessage,
        },
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND,
            host: false,
            onMessage: onNydusMessage,
        },
    ],
});

function onNydusMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            doPanelOpenAction();
            break;
        case MESSAGE_TYPE.REFRESH:
            reloadExtension(message.tabId);
            break;
        case MESSAGE_TYPE.INSPECT:
            doInspectAction();
            break;
    }
}

async function doPanelOpenAction() {
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.PANEL_OPENED,
    });
}

async function doInspectAction() {
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.INSPECT
    });
}

/**
 * @param {number} tabId
 */
async function reloadExtension(tabId) {
    await nydus.whenReady;

    chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPE.REFRESH,
        tabId: tabId
    });
}
