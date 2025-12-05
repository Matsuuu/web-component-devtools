import browser, { Tabs } from "webextension-polyfill";
import { LAYER } from "../messages/layers";
import { SelectInspectMessage } from "../messages/select-inspect-message";

export function initContextMenu() {
    const inspectMenuItem = browser.contextMenus.create({
        id: "INSPECT_WCDT",
        title: "Inspect with Web Component Devtools",
        contexts: ["all"],
    });

    browser.contextMenus.onClicked.addListener((info: any, tab: Tabs.Tab | undefined) => {
        // TODO: Check that this doesn't actually trigger in all calls to contextmenu
        if (tab?.id && tab.id > 0) {
            browser.tabs
                .sendMessage(tab.id, { from: LAYER.BACKGROUND, to: LAYER.INPAGE, data: new SelectInspectMessage() })
                .catch(err => {
                    console.warn("Failed at sending a message from context menu to inpage", err);
                });
        }
    });
}
