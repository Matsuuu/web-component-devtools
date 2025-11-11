import browser from "webextension-polyfill";

async function injectInPageCodeToUserContext(tabId: number) {
    await browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ["inpage.js"],
        world: "MAIN",
    });
}

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        injectInPageCodeToUserContext(tabId);
    }
});
