import { getCurrentTab } from "../util/tabs.js";
import "./background.js";

async function injectContentScript() {
    const tab = await getCurrentTab();
    if (tab.url.startsWith("chrome://")) return;
    if (tab.url.includes("youtube.com")) return; // Youtube just bricks this for some reason atm

    await chrome.scripting.unregisterContentScripts({
        ids: ["web-component-devtools"]
    });

    console.log(chrome.scripting.getRegisteredContentScripts());

    await chrome.scripting.registerContentScripts([
        {
            id: "web-component-devtools",
            matches: ["http://*/*", "https://*/*"],
            js: ["crawler-inject.js"],
            runAt: "document_idle",
            world: "MAIN",
        }
    ]);

}

chrome.tabs.onUpdated.addListener(injectContentScript);
chrome.tabs.onActivated.addListener(injectContentScript);
