// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no Web Components are on page, don't create panel

import { buildNydus } from "./messaging/nydus.js";
import { CONNECTION_CHANNELS } from "./types/connection-channels.js";
import { MESSAGE_TYPE } from "./types/message-types.js";

let nydus;

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
        requiredConnections: [
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
    console.log("PANEL OPENED");
    panel.onShown.addListener(() => {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        console.log("PANEL OPENED");
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId,
        });
    });
}

function addTabListeners() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
    });
}

/**
 * @param {chrome.devtools.panels.ExtensionPanel} panel
 * */
async function initListeners(panel) {
    createDevtoolsNydus();
    console.log("On start");
    console.log(nydus);
    await nydus.whenReady;
    console.log("On ready");
    addPanelListeners(panel);
    addTabListeners();
}

async function init() {
    const panel = await initPanel();
    initListeners(panel);
}

init();

// TODO(matsuuu): Should we maybe have multiple views/tabs?
