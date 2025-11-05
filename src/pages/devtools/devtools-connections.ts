import { isElementTreeMessage } from "../messages/element-tree-message";
import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { devtoolsState } from "./state/devtools-context";

export function initConnections() {
    const port = chrome.runtime.connect({ name: LAYER.DEVTOOLS });

    port.onMessage.addListener(message => {
        console.log("Message received: ", message);
        const data = message.data;
        if (isInitMessage(data)) {
            window.panel.setConnectedTab(data.tabId);
        }
        if (isElementTreeMessage(data)) {
            window.panel.setElementTree(data.tree);
        }
    });

    const tabId = chrome.devtools.inspectedWindow.tabId;
    port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.CONTENT, data: new InitMessage(tabId) });

    devtoolsState.messagePort = port;
}
