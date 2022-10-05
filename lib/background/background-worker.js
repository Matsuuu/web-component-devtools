import { getCurrentTab } from "../util/tabs.js";
//import "./background.js";
console.log("Hello from background worker");

async function injectContentScript() {
    console.log("Foo");
    const tab = await getCurrentTab();
    console.log(tab)
    if (tab.url.startsWith("chrome://")) return;

    /*chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ['web-component-devtools-dom-action-injector.js'],
        world: "MAIN"
    }, (par) => {
        console.log("Inject Callback")
        console.log("PAR", par)
    });*/

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


injectContentScript();

chrome.tabs.onActivated.addListener(injectContentScript);
