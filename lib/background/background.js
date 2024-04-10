import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus } from 'nydus';
import { analyzeAllScripts, analyzeAndUpdateElement, resetAnalyzer } from 'analyzer';
console.log("Hello from background js");

let latestSelects = {};
let nydus;

function createNydus() {
    nydus = buildNydus({
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
                bridge: CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT
            },
        ],
        isBackground: true,
    });

}

function bridgeToPanel(message) {
    if (message.type === MESSAGE_TYPE.ANALYZE_ELEMENT) {
        analyzeCustomElement(message);
        return;
    }
    if (message.type === MESSAGE_TYPE.SELECT_RESULT) {
        saveSelectResult(message);
    }
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND, message);
}

function onNydusMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPE.PANEL_OPENED:
            doPanelOpenAction(message);
            break;
        case MESSAGE_TYPE.PANEL_CLOSED:
            doPanelClosedAction(message);
            break;
        case MESSAGE_TYPE.REFRESH:
            reloadExtension(message);
            break;
        case MESSAGE_TYPE.INSPECT:
            doInspectAction();
            break;
    }
}

function saveSelectResult(message) {
    const eventData = message.data;
    latestSelects[eventData.tabId] = eventData;
}

// TODO: Clean up the cache
function getLatestSelectResult(tabId) {
    return latestSelects[tabId] ?? null;
}

async function doPanelOpenAction(message) {
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.PANEL_OPENED,
        tabId: message?.tabId
    });
}

async function doPanelClosedAction(message) {
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.PANEL_CLOSED,
        tabId: message?.tabId
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
    console.log("Reloading extension...");
    chrome.tabs.sendMessage(message.tabId, message);
    chrome.runtime.sendMessage(message);
    await nydus.whenReady;
    console.log("Reloading extension - Nydus ready, sending message...");
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
        ...message
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
            latestSelect: getLatestSelectResult(tabId)
        });
        tabSites[tabId] = tab.url;
        resetAnalyzer(tabId);

        setTimeout(() => {
            // Safeguard if the connection pool is being populated, but 
            // the connections are hanging, causing the devtools to hang.
            if (nydus && Object.keys(nydus.connections).length > 0 && !nydus.ready) {
                console.warn("[WebComponentDevTools]: Rebuilding connection pool Nydus");
                nydus._reConnectDisconnected();
                //createNydus();
            }
        }, 15000);
    }
}

let tabSites = {};
function addTabListeners() {
    chrome.tabs.onUpdated.addListener(tabUpdateListener);
}

async function analyzeCustomElement(message) {
    const eventData = message.eventData;
    await analyzeAllScripts(message.pageSources, message.pageInlineSources, message.origin, message.fullPath, message.tabId);
    await analyzeAndUpdateElement(eventData, message.origin, message.tabId);
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, { type: MESSAGE_TYPE.ANALYZE_ELEMENT_RESULT, analysisResult: eventData, tabId: message.tabId });
}

export function initBackground() {
    console.log("Initializing background");
    addTabListeners();
    createNydus();
}
