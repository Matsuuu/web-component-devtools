import { initMessage, isInitMessage } from "../messages/init";
import { LAYER } from "../messages/layers";

export function initConnections() {
    const port = chrome.runtime.connect({ name: LAYER.DEVTOOLS });

    port.onMessage.addListener(message => {
        console.log("Message received: ", message);
        const data = message.data;
        if (isInitMessage(data)) {
            window.panel.setConnectedTab(data.tabId);
            console.log("Settings window panel things ", window.panel);
        }
    });

    const tabId = chrome.devtools.inspectedWindow.tabId;
    console.log("Posting init message. My tab id is : ", tabId);
    port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.CONTENT, data: initMessage(tabId) });
}
