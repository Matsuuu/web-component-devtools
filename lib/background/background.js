import { MESSAGE_TYPE } from '../types/message-types.js';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus } from 'nydus';
import { analyzeAllScripts, analyzeAndUpdateElement, resetAnalyzer } from '../cem/web-analyzer.js';

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
                onMessage: bridgeToContent,
            },
        ],
        isBackground: true,
    });

}

function bridgeToContent(message) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, message);
}

function bridgeToPanel(message) {
    if (message.type === MESSAGE_TYPE.ANALYZE_ELEMENT) {
        analyzeCustomElement(message);
        return;
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
    chrome.tabs.sendMessage(message.tabId, message);
    chrome.runtime.sendMessage(message);
    await nydus.whenReady;
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, {
        type: MESSAGE_TYPE.REFRESH,
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
        tabSites[tabId] = tab.url;
        resetAnalyzer(tabId);

        setTimeout(() => {
            // Safeguard if the connection pool is being populated, but 
            // the connections are hanging, causing the devtools to hang.
            if (nydus && Object.keys(nydus.connections).length > 0 && !nydus.ready) {
                console.warn("[WebComponentDevTools]: Rebuilding connection pool Nydus");
                createNydus();
            }
        }, 5000);
    }
}

let tabSites = {};
function addTabListeners() {
    chrome.tabs.onUpdated.addListener(tabUpdateListener);
}

async function analyzeCustomElement(message) {
    const eventData = message.eventData;
    await analyzeAllScripts(message.pageSources, message.pageInlineSources, message.origin, message.tabId);
    await analyzeAndUpdateElement(eventData, message.origin, message.tabId);
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_BACKGROUND_CONTENT, { type: MESSAGE_TYPE.ANALYZE_ELEMENT_RESULT, analysisResult: eventData });
}

addTabListeners();
createNydus();
