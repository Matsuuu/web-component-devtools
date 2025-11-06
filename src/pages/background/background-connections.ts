import { ConnectionToContentFailedMessage } from "../messages/connection-to-content-failed-message";
import { isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";

const devToolsPorts: Record<number, chrome.runtime.Port> = {};

export function initConnections() {
    chrome.runtime.onConnect.addListener(port => {
        if (port.name === LAYER.DEVTOOLS) {
            let tabId = 9999;

            port.onDisconnect.addListener(() => {
                delete devToolsPorts[tabId];
            });

            port.onMessage.addListener(message => {
                console.log("Got message ", message);
                const data = message.data;
                if (isInitMessage(data)) {
                    tabId = data.tabId!;
                    devToolsPorts[tabId] = port;
                }

                if (message.to === LAYER.CONTENT) {
                    console.log("Trying to send to content");
                    chrome.tabs.sendMessage(tabId, message).catch(err => {
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

    chrome.runtime.onMessage.addListener((message, sender) => {
        if (message.from === LAYER.CONTENT && message.to === LAYER.DEVTOOLS && sender.tab) {
            console.log("Message from content: ", message);
            const port = devToolsPorts[sender.tab.id!];
            if (port) {
                port.postMessage(message);
            }
        }
    });
}
