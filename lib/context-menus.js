import { buildNydus } from "./messaging/nydus";
import { CONNECTION_CHANNELS } from "./types/connection-channels";
import { MESSAGE_TYPE } from "./types/message-types";

let nydus;

const contextMenuOptions = {
    title: "Inspect Web Component",
    type: "normal",
    id: "Aaaaaaaaaaaaa",
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
    console.log({ info, tab });

    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND, { type: MESSAGE_TYPE.INSPECT });
    //TODO(Matsuuu): Trigger query event, after query event is finished,
    // trigger a custom select event, where we know the element.
    // Get the element from
    // window["__WC_DEV_TOOLS_CONTEXT_MENU_TARGET"]
    // and compare/find it and then select that in dev tools
}

function createContextMenusNydus() {
    nydus = buildNydus({
        requiredConnections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_CONTEXT_MENU_TO_BACKGROUND,
                host: true,
                ignoreTabs: true,
            },
        ],
    });
}

createContextMenusNydus();
