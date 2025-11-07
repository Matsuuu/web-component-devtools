import { wait } from "@src/lib/utils/wait";
import { isElementTreeMessage } from "../messages/element-tree-message";
import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { devtoolsState } from "./state/devtools-context";
import { isConnectionToContentFailedMessage } from "../messages/connection-to-content-failed-message";
import { isRequestInitMessage } from "../messages/request-init-message";
import browser from "webextension-polyfill";

let isInitialized = false;
let messageQueue: any[] = [];
let isPanelReady = false;

function processQueuedMessages() {
    messageQueue.forEach(message => handleMessage(message));
    messageQueue = [];
}

function handleMessage(message: any) {
    const data = message.data;
    
    if (!isPanelReady) {
        messageQueue.push(message);
        return;
    }

    if (isInitMessage(data)) {
        window.panel.setConnectedTab(data.tabId);
    }
    if (isElementTreeMessage(data)) {
        window.panel.setElementTree(data.tree);
    }
    if (isConnectionToContentFailedMessage(data)) {
        window.panel.disconnect("Could not connect to the content page. Please refresh the page and try again.");
    }
    if (isRequestInitMessage(data)) {
        const tabId = browser.devtools.inspectedWindow.tabId;
        const port = browser.runtime.connect({ name: LAYER.DEVTOOLS });
        port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.CONTENT, data: new InitMessage(tabId) });
    }
}

export function notifyPanelReady() {
    isPanelReady = true;
    processQueuedMessages();
}

export function initConnections() {
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    const port = browser.runtime.connect({ name: LAYER.DEVTOOLS });

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(async () => {
        console.log("Disconnected");
        window.panel.disconnect("Lost connection to the site. Reconnecting in 3...");
        await wait(1000);
        window.panel.disconnect("Lost connection to the site. Reconnecting in 2...");
        await wait(1000);
        window.panel.disconnect("Lost connection to the site. Reconnecting in 1...");
        await wait(1000);
        window.location.reload();
    });

    const tabId = browser.devtools.inspectedWindow.tabId;
    port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.CONTENT, data: new InitMessage(tabId) });

    devtoolsState.messagePort = port;
}
