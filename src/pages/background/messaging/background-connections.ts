import { ConnectionToContentFailedMessage } from "@src/pages/messages/connection-to-content-failed-message";
import { isInitMessage } from "@src/pages/messages/init-message";
import { LAYER } from "@src/pages/messages/layers";
import browser from "webextension-polyfill";
import { handleDevtoolsToBackgroundMessage } from "./background-from-devtools-connection";

const devToolsPorts: Record<number, browser.Runtime.Port> = {};
let isInitialized = false;

export function initConnections() {
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    browser.runtime.onConnect.addListener(port => {
        if (port.name === LAYER.DEVTOOLS) {
            let tabId: number | null = null;

            port.onDisconnect.addListener(() => {
                if (tabId !== null) {
                    delete devToolsPorts[tabId];
                }
            });

            // When Devtools messages background
            port.onMessage.addListener((message: any) => {
                const data = message.data;

                // Initial setup as soon as we get the tab id
                if (message.to === LAYER.BACKGROUND && !tabId && isInitMessage(data)) {
                    tabId = data.tabId!;
                    if (tabId && !devToolsPorts[tabId]) {
                        devToolsPorts[tabId] = port;
                    }
                }

                if ((message.to === LAYER.CONTENT || message.to === LAYER.INPAGE) && tabId != null) {
                    bridgeMessageToContentAndInpage(tabId, message);
                }

                if (message.to === LAYER.BACKGROUND && tabId) {
                    handleDevtoolsToBackgroundMessage(message, port, devToolsPorts, tabId);
                }
            });
        }
    });

    // When Content or Inpage messages background
    browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
        console.log("Background got message: ", message);
        if (message.to === LAYER.DEVTOOLS && sender.tab) {
            const port = devToolsPorts[sender.tab.id!];
            if (port) {
                console.log("Sending it to ", port);
                port.postMessage(message);
            } else {
                console.warn("Background: No DevTools port found for tab", sender.tab.id);
            }
        }
    });
}

function bridgeMessageToContentAndInpage(tabId: number, message: any) {
    console.log("Bridgeing message to ", { tabId, message });
    browser.tabs.sendMessage(tabId, message).catch(err => {
        console.warn("Failed at sending a message from background to content", err);
        if (tabId !== null) {
            devToolsPorts[tabId].postMessage({
                from: LAYER.BACKGROUND,
                to: LAYER.DEVTOOLS,
                data: new ConnectionToContentFailedMessage(tabId),
            });
        }
    });
}
