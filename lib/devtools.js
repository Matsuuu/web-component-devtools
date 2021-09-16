// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no Web Components are on page, don't create panel

import { buildNydus } from "nydus";
import { CONNECTION_CHANNELS } from "./types/connection-channels.js";
import { MESSAGE_TYPE } from "./types/message-types.js";

let nydus;
let devtoolPanel;
let tabSites = {};

function initPanel() {
    return new Promise((resolve) => {
        chrome.devtools.panels.create(
            "Web Components",
            "/logo-128.png",
            "/wc-devtools.html",
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
                host: false,
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
    panel.onHidden.addListener(() => {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.PANEL_CLOSED,
            tabId,
        });
    });
}

/**
 * @param {chrome.devtools.panels.ExtensionPanel} panel
 * */
async function initListeners(panel) {
    createDevtoolsNydus();
    await nydus.whenReady;
    addPanelListeners(panel);
}

async function init() {
    if (devtoolPanel) return;

    devtoolPanel = await initPanel();
    initListeners(devtoolPanel);
}

init();
