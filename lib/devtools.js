// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no lit elements are on the page, no need to instantiate.

import { CONNECTION_TYPES } from "./types/connection-types";
import { MESSAGE_TYPE } from "./types/message-types.js";

// >>>> Need to find out a way to detect if any lit elements are on the page.
//
//
const devtoolsMessageChannels = {};

/**
 * Only this layer can listen for panel openings.
 * This is why the whole even loop start from here.
 *
 * Our connection graph goes
 *
 * devtools.js => background.js => content_messaging.js => devtools panel (init.js)
 * */
chrome.devtools.panels.create(
    "Web Component Devtools",
    null,
    "/dist/wc-devtools-chrome.html",
    (panel) => {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        panel.onShown.addListener(() => {
            if (!devtoolsMessageChannels[tabId]) {
                devtoolsMessageChannels[tabId] = chrome.runtime.connect({
                    name: CONNECTION_TYPES.DEVTOOLS_INITIALIZER,
                });
            }
            devtoolsMessageChannels[tabId]?.postMessage({
                type: MESSAGE_TYPE.PANEL_OPENED,
                tabId,
            });
        });
    }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        console.log(devtoolsMessageChannels);
        devtoolsMessageChannels[tabId]?.postMessage({
            type: MESSAGE_TYPE.PANEL_OPENED,
            tabId
        });
        devtoolsMessageChannels[tabId]?.postMessage({
            type: MESSAGE_TYPE.REFRESH,
            tabId
        });
    }
});

// TODO(Matsuuu): Clean up the messaging on init
// TODO(matsuuu): Should we maybe have multiple views/tabs?
