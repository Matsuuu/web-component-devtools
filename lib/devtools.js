// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no lit elements are on the page, no need to instantiate.

import { buildNydus } from "./messaging/nydus.js";
import { CONNECTION_CHANNELS } from "./types/connection-channels.js";
import { MESSAGE_TYPE } from "./types/message-types.js";

// >>>> Need to find out a way to detect if any lit elements are on the page.
//
//
let nydus;


function initPanel() {
    return new Promise(resolve => {
        chrome.devtools.panels.create(
            "Web Component Devtools",
            null,
            "/dist/wc-devtools-chrome.html",
            (panel) => {
                console.log("Panel", panel);
                resolve(panel);
            }
        );
    });
}

async function initListeners(panel) {
    console.log("Init listeners");
    nydus = buildNydus({
        requiredConnections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER,
                host: true,
                ignoreTabs: true
            },
        ],
    });

    await nydus.whenReady;
    console.log("On nydus ready");

    panel.onShown.addListener(() => {
        console.log("OnShown");
        const tabId = chrome.devtools.inspectedWindow.tabId;
        nydus.message(CONNECTION_CHANNELS.DEVTOOLS_INITIALIZER, {
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId,
        });
    });


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

async function init() {
    const panel = await initPanel();
    initListeners(panel);

    /*
    panel.onShown.addListener(() => {
        console.log("OnShown");

        const tabId = chrome.devtools.inspectedWindow.tabId;
        console.log(tabId);
        chrome.runtime.sendMessage({
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId,
        });
    });
    */
}
/**
 * Only this layer can listen for panel openings.
 * This is why the whole even loop start from here.
 *
 * Our connection graph goes
 *
 * devtools.js => background.js => content_messaging.js => devtools panel (init.js)
 * */

init();

// TODO(Matsuuu): Clean up the messaging on init
// TODO(matsuuu): Should we maybe have multiple views/tabs?
