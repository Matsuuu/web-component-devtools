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

            port.onMessage.addListener((message: any) => {
                const data = message.data;
                if (isInitMessage(data)) {
                    tabId = data.tabId!;
                    devToolsPorts[tabId] = port;
                    // WHen devtools is opened, we want to inject the initialization to DOM
                    injectCodeToUserContext(data.tabId);
                }

                if (message.to === LAYER.CONTENT && tabId != null) {
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

                if (message.to === LAYER.BACKGROUND) {
                    if (message.from === LAYER.DEVTOOLS && tabId) {
                        handleDevtoolsToBackgroundMessage(message, tabId);
                    }
                }
            });
        }
    });

    browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
        if (message.from === LAYER.CONTENT && message.to === LAYER.DEVTOOLS && sender.tab) {
            const port = devToolsPorts[sender.tab.id!];
            if (port) {
                port.postMessage(message);
            } else {
                console.error("Background: No DevTools port found for tab", sender.tab.id);
            }

            const data = message.data;

            if (isInitMessage(data)) {
                // TODO: Find CEM and parse it for us to use
                // TODO: Is this the best place? Maybe do it after opening the devtools idk?
            }
        }
    });
}

async function injectCodeToUserContext(tabId: number) {
    await browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ["inpage.js"],
        world: "MAIN",
    });
}
