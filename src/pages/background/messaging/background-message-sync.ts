import browser from "webextension-polyfill";

export function messageContentSync(message: any, tabId: number) {
    return new Promise((resolve, reject) => {
        browser.tabs.sendMessage(tabId, message).catch(err => {
            console.warn("Failed at sending a message from background to content", err);
            reject();
        });
    });
}
