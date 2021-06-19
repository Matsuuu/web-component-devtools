import { buildNydus } from "./messaging/nydus";
import { CONNECTION_CHANNELS } from "./types/connection-channels";
import { MESSAGE_TYPE } from "./types/message-types";

let nydus;

const contextMenuOptions = {
    title: "Inspect Web Component",
    type: "normal",
    id: "wc-devtoolsinspect-web-component",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
    onclick: onWebComponentInspect,
    visible: true, // True if page has web components
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create(contextMenuOptions);

/**
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
 */
function onWebComponentInspect(info, tab) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND, { type: MESSAGE_TYPE.INSPECT });
}

function createContextMenusNydus() {
    nydus = buildNydus({
        requiredConnections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND,
                host: true,
                isBackground: true,
            },
        ],
    });
}

createContextMenusNydus();
