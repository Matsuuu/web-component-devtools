import { buildNydus } from "nydus";
import { CONNECTION_CHANNELS } from "./types/connection-channels";
import { MESSAGE_TYPE } from "./types/message-types";

let nydus;

const contextMenuOptions = {
    title: "Inspect Web Component",
    type: "normal",
    id: "wc-devtoolsinspect-web-component",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
    //onclick: onWebComponentInspect,
    visible: true, // True if page has web components
}

if (chrome.contextMenus) {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create(contextMenuOptions);
    // @ts-ignore
    chrome.contextMenus.onClicked = onWebComponentInspect;
}

/**
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
 */
function onWebComponentInspect(info, tab) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND, { type: MESSAGE_TYPE.INSPECT });
}

function createContextMenusNydus() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND,
                host: false,
                isBackground: true,
            },
        ],
    });
}

createContextMenusNydus();
