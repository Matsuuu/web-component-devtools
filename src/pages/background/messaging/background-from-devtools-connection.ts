import { HeartbeatMessage, isHeartbeatMessage } from "@src/pages/messages/heartbeat-message";
import { isInitMessage } from "@src/pages/messages/init-message";
import { LAYER } from "@src/pages/messages/layers";
import browser from "webextension-polyfill";

export async function handleDevtoolsToBackgroundMessage(
    message: any,
    port: browser.Runtime.Port,
    devToolsPorts: Record<number, browser.Runtime.Port>,
    tabId: number,
) {
    const data = message.data;

    if (isInitMessage(data)) {
        injectCodeToUserContext(data.tabId);
        // WHen devtools is opened, we want to inject the initialization to DOM
    }

    if (isHeartbeatMessage(data)) {
        console.log("Heartbeat from ", data.tabId);

        devToolsPorts[tabId].postMessage({
            from: LAYER.BACKGROUND,
            to: LAYER.DEVTOOLS,
            data: new HeartbeatMessage(tabId),
        });
    }
}

async function injectCodeToUserContext(tabId: number) {
    await browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ["inpage.js"],
        world: "MAIN",
    });
}
