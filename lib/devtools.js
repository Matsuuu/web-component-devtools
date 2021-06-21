// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no Web Components are on page, don't create panel

import { buildNydus } from "./messaging/nydus.js";
import { CONNECTION_CHANNELS } from "./types/connection-channels.js";
import { MESSAGE_TYPE } from "./types/message-types.js";

let nydus;
let devtoolPanel;

function initPanel() {
    return new Promise((resolve) => {
        chrome.devtools.panels.create(
            "Web Component Devtools",
            null,
            "/dist/wc-devtools-chrome.html",
            (panel) => {
                resolve(panel);
            }
        );
    });
}

function createDevtoolsNydus() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER,
                host: true,
                isBackground: true,
            },
        ],
    });
}

/**
 * @param {chrome.devtools.panels.ExtensionPanel} panel
 */
function addPanelListeners(panel) {
    panel.onShown.addListener(() => {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId,
        });
    });
}

function tabUpdateListener(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId,
        });
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.REFRESH,
            tabId,
        });
    }
}

function addTabListeners() {
    chrome.tabs.onUpdated.addListener(tabUpdateListener);
}

/**
 * @param {chrome.devtools.panels.ExtensionPanel} panel
 * */
async function initListeners(panel) {
    createDevtoolsNydus();
    await nydus.whenReady;
    addPanelListeners(panel);
    addTabListeners();
}

async function init() {
    if (devtoolPanel) return;

    devtoolPanel = await initPanel();
    initListeners(devtoolPanel);
}

init();

// TODO(matsuuu): Should we maybe have multiple views/tabs?
