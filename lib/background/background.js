import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus } from 'nydus';
import { mapCustomElementManifestData } from '../cem/custom-elements-manifest-parser.js';

const nydus = buildNydus({
    connections: [
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT,
            host: true,
            onMessage: bridgeToPanel,
        },
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER,
            host: true,
            onMessage: onNydusMessage,
            isBackground: true,
        },
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND,
            host: true,
            onMessage: onNydusMessage,
            isBackground: true,
        },
        {
            id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND,
            host: true,
            onMessage: bridgeToContent,
        },
    ],
    isBackground: true,
});

function bridgeToContent(message) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, message);
}

function bridgeToPanel(message) {
    if (message.type === MESSAGE_TYPE.MANIFEST_FETCH) {
        loadCustomElementManifestData(message.baseUrl);
        return;
    }
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND, message);
}

function onNydusMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            doPanelOpenAction();
            break;
        case MESSAGE_TYPE.REFRESH:
            reloadExtension(message);
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
        type: MESSAGE_TYPE.INSPECT,
    });
}

/**
 * @param {any} message
 */
async function reloadExtension(message) {
    if (message.tabId < 0) return;
    chrome.tabs.sendMessage(message.tabId, message);
    chrome.runtime.sendMessage(message);
}

async function loadCustomElementManifestData(baseUrl) {
    const customElementManifestData = await mapCustomElementManifestData(baseUrl);
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.MANIFEST_FETCH,
        manifest: customElementManifestData,
    });
}

/**
 * @param {string | number} tabId
 * @param {{ status: string; }} changeInfo
 * @param {chrome.tabs.Tab} tab
 */
function tabUpdateListener(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        reloadExtension({
            type: MESSAGE_TYPE.REFRESH,
            tabId,
            doReSelect: tabSites[tabId] && tabSites[tabId] === tab.url,
        });
        doPanelOpenAction();
        tabSites[tabId] = tab.url;
    }
}

let tabSites = {};
function addTabListeners() {
    chrome.tabs.onUpdated.addListener(tabUpdateListener);
}

addTabListeners();
