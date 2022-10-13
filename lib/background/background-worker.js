import { getCurrentTab } from "../util/tabs.js";
import "./background.js";
console.log("Hello from background-worker.js");

async function injectContentScript() {
    const tab = await getCurrentTab();
    if (tab.url.startsWith("chrome://")) return;

    console.log("Registering crawler inject");

    console.log(chrome.scripting)

    await chrome.scripting.unregisterContentScripts();

    await chrome.scripting.registerContentScripts([
        {
            id: "web-component-devtools-" + tab.id,
            matches: ["http://*/*", "https://*/*"],
            js: ["crawler-inject.js"],
            runAt: "document_idle",
            world: "MAIN",
        }
    ]);
}

chrome.tabs.onUpdated.addListener(() => console.log("Updated"));
chrome.tabs.onActivated.addListener(injectContentScript);
