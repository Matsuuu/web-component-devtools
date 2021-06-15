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
    ],
});

nydus.whenReady.then(() => console.log("Background nydus ready"));

function onNydusMessage(message) {
    console.log("On background message", message);
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            doPanelOpenAction();
            break;
        case MESSAGE_TYPE.REFRESH:
            reloadExtension();
            break;
    }
}

// TODO(Matsuuu): Should nydus be tab specific? Let's see
async function doPanelOpenAction() {
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.PANEL_OPENED,
    });
}

async function reloadExtension() {
    await nydus.whenReady;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: MESSAGE_TYPE.REFRESH,
        });
    });

    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
    });
}
