import { wait } from "@src/lib/utils/wait";
import { isElementTreeMessage } from "../messages/element-tree-message";
import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { devtoolsState } from "./state/devtools-context";
import { isConnectionToContentFailedMessage } from "../messages/connection-to-content-failed-message";
import { isRequestInitMessage } from "../messages/request-init-message";
import browser from "webextension-polyfill";
import { HeartbeatMessage, isHeartbeatMessage } from "../messages/heartbeat-message";
import { LaunchInPageMessage } from "../messages/launch-inpage-message";
import { log, LogLevel } from "@src/lib/logger/log";
import { isPingMessage } from "../messages/ping-message";
import { isSelectResultMessage } from "../messages/select-result-message";

let isInitialized = false;
let messageQueue: any[] = [];
let isPanelReady = false;

function processQueuedMessages() {
    messageQueue.forEach(message => handleMessage(message));
    messageQueue = [];
}

function handleMessage(message: any) {
    const data = message.data;
    if (!isPingMessage(message.data)) {
        log(LogLevel.DEBUG, "Message in Devtools: ", message);
    }

    if (!isPanelReady) {
        messageQueue.push(message);
        return;
    }

    if (isInitMessage(data)) {
        initializeConnections(message, data);
        return;
    }
    if (isElementTreeMessage(data)) {
        window.panel.setElementTree(data.tree);
        return;
    }
    if (isConnectionToContentFailedMessage(data)) {
        window.panel.disconnect("Could not connect to the content page. Please refresh the page and try again.");
        return;
    }
    if (isRequestInitMessage(data)) {
        // As the content script initializes, if it didn't receive an INIT
        // request within a specified time frame, we send an Init Request
        // to the Devtools layer. This will just send an Init to our content script,
        // starting up the whole Init cycle
        const tabId = browser.devtools.inspectedWindow.tabId;
        devtoolsState.messagePort.postMessage({
            from: LAYER.DEVTOOLS,
            to: LAYER.CONTENT,
            data: new InitMessage(tabId, "InitRequested"),
        });
        return;
    }

    if (isHeartbeatMessage(data)) {
        console.log("Heartbeat from background");
        return;
    }

    if (isSelectResultMessage(data)) {
        window.panel.selectElement(data);
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
    port.onDisconnect.addListener(onDisconnect);

    const tabId = browser.devtools.inspectedWindow.tabId;
    port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.BACKGROUND, data: new InitMessage(tabId, "InitConnections") });

    devtoolsState.messagePort = port;
}

function initializeConnections(message: any, data: InitMessage) {
    if (message.from === LAYER.CONTENT) {
        window.panel.setConnectedTab(data.tabId);
        devtoolsState.messagePort.postMessage({
            from: LAYER.DEVTOOLS,
            to: LAYER.BACKGROUND,
            data: new LaunchInPageMessage(data.tabId),
        });
    } else {
        devtoolsState.messagePort.postMessage({
            from: LAYER.DEVTOOLS,
            to: LAYER.CONTENT,
            data: new InitMessage(data.tabId),
        });
    }
}

async function onDisconnect() {
    console.log("Disconnected");
    window.panel.disconnect("Lost connection to the site. Reconnecting in 3...");
    await wait(1000);
    window.panel.disconnect("Lost connection to the site. Reconnecting in 2...");
    await wait(1000);
    window.panel.disconnect("Lost connection to the site. Reconnecting in 1...");
    await wait(1000);
    window.location.reload();
}

/**
 * This is mostly for debugging background-devtools connection
 * */
function startHeartbeat(port: browser.Runtime.Port) {
    setInterval(() => {
        const tabId = browser.devtools.inspectedWindow.tabId;
        port.postMessage({ from: LAYER.DEVTOOLS, to: LAYER.BACKGROUND, data: new HeartbeatMessage(tabId) });
    }, 2000);
}
