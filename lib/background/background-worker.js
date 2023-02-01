import { getCurrentTab } from "../util/tabs.js";
import "./background.js";

async function injectContentScript() {
    const tab = await getCurrentTab();
    if (tab.url.startsWith("chrome://")) return;

    await chrome.scripting.unregisterContentScripts();

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
