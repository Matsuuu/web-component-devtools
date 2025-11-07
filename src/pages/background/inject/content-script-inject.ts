import browser from "webextension-polyfill";
import { contentConnectionsState } from "../../content/messaging/content-connection";

export async function queryCustomElementDataFromUserWindow(customElementName: string) {
    if (!contentConnectionsState.tabId) {
        console.warn("Could not query Custom Element from window: no tabId set.");
        return;
    }

    await browser.scripting.executeScript({
        target: { tabId: contentConnectionsState.tabId },
        func: () => {
            const element = window.customElements.get(customElementName);
            window.postMessage({ context: "WEB_COMPONENT_DEVTOOLS", type: "CUSTOM_ELEMENT_QUERY", data: element });
        },
    });
}
