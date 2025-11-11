import { HeartbeatMessage, isHeartbeatMessage } from "@src/pages/messages/heartbeat-message";
import { InitMessage, isInitMessage } from "@src/pages/messages/init-message";
import { isLaunchInPageMessage } from "@src/pages/messages/launch-inpage-message";
import { LAYER } from "@src/pages/messages/layers";
import { isPingMessage, PingMessage } from "@src/pages/messages/ping-message";
import browser from "webextension-polyfill";

export async function handleDevtoolsToBackgroundMessage(
    message: any,
    port: browser.Runtime.Port,
    devToolsPorts: Record<number, browser.Runtime.Port>,
    tabId: number,
) {
    const data = message.data;

    if (isInitMessage(data)) {
        // Send Init ACK to dev so they can start connecting to content etc.
        devToolsPorts[tabId].postMessage({
            from: LAYER.BACKGROUND,
            to: LAYER.DEVTOOLS,
            data: new InitMessage(tabId),
        });
    }

    if (isLaunchInPageMessage(data)) {
        // TODO:  can we somehow prevent multiple injections?
        injectCodeToUserContext(data.tabId);

        browser.tabs
            .sendMessage(tabId, { from: LAYER.BACKGROUND, to: LAYER.INPAGE, data: new InitMessage(data.tabId) })
            .catch(err => {
                console.warn("Failed at sending a message from background to content", err);
            });
    }

    if (isHeartbeatMessage(data)) {
        console.log("Heartbeat from ", data.tabId);

        devToolsPorts[tabId].postMessage({
            from: LAYER.BACKGROUND,
            to: LAYER.DEVTOOLS,
            data: new HeartbeatMessage(tabId),
        });
    }

    if (isPingMessage(data)) {
        devToolsPorts[tabId].postMessage({
            from: LAYER.BACKGROUND,
            to: LAYER.DEVTOOLS,
            data: new PingMessage(),
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
