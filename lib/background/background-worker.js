import { siteIsOnBlockList } from "../util/block-list.js";
import { getCurrentTab } from "../util/tabs.js";
import { initBackground } from "./background.js";

async function injectContentScript() {
    const tab = await getCurrentTab();
    if (!tab.url) {
        return;
    }

    console.log("[injectContentScript] on ", tab.url);

    if (siteIsOnBlockList(tab.url)) {
        console.log("Skipping injects for page ", tab.url);
        return;
    }

    const registeredScripts = await chrome.scripting.getRegisteredContentScripts();

    if (registeredScripts.find(scr => scr.id === "web-component-devtools")) {
        try {
            await chrome.scripting.unregisterContentScripts({
                ids: ["web-component-devtools"]
            });
        } catch (ex) {
            console.warn("Failed to unregister content script for ", tab.url);
        }
    }

    try {
        await chrome.scripting.registerContentScripts([
            {
                id: "web-component-devtools",
                matches: ["http://*/*", "https://*/*"],
                js: ["crawler-inject.js"],
                runAt: "document_idle",
                world: "MAIN",
            }
        ]);
    } catch (ex) {
        console.warn("Failed to register content script for ", tab.url);
    }

    initBackground();
}

chrome.tabs.onUpdated.addListener(injectContentScript);
chrome.tabs.onActivated.addListener(injectContentScript);
