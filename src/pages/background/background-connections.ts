import { ConnectionToContentFailedMessage } from "../messages/connection-to-content-failed-message";
import { isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import browser from "webextension-polyfill";

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

            port.onMessage.addListener((message: any) => {
                const data = message.data;
                if (isInitMessage(data)) {
                    tabId = data.tabId!;
                    devToolsPorts[tabId] = port;
                }

                if (message.to === LAYER.CONTENT && tabId !== null) {
                    browser.tabs.sendMessage(tabId, message).catch(err => {
                        console.warn("Failed at sending a message from background to content", err);
                        devToolsPorts[tabId].postMessage({
                            from: LAYER.BACKGROUND,
                            to: LAYER.DEVTOOLS,
                            data: new ConnectionToContentFailedMessage(tabId),
                        });
                    });
                }
            });
        }
    });

    browser.runtime.onMessage.addListener((message: any, sender: any) => {
        if (message.from === LAYER.CONTENT && message.to === LAYER.DEVTOOLS && sender.tab) {
            const port = devToolsPorts[sender.tab.id!];
            if (port) {
                port.postMessage(message);
            } else {
                console.error("Background: No DevTools port found for tab", sender.tab.id);
            }
        }
    });
}
