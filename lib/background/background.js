import { MESSAGE_TYPE } from "../types/message-types.js";

const ports = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        reloadExtension(tabId);
    }
});

chrome.runtime.onConnect.addListener(port => {
    const tabId = port?.sender?.tab?.id
    if (tabId) {
        ports[tabId] = port;
    }
});

function reloadExtension(tabId) {
    console.log("Refreshing");
    ports[tabId]?.postMessage({
        type: MESSAGE_TYPE.REFRESH,
    });
}

