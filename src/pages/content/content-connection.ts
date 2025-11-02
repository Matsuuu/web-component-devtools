import { initMessage, isInitMessage } from "../messages/init";
import { LAYER } from "../messages/layers";

export function initConnection() {
    chrome.runtime.onMessage.addListener((message, sender) => {
        const data = message.data;

        if (message.from === LAYER.DEVTOOLS) {
            if (isInitMessage(data)) {
                console.log("Init received from Devtools, responding.");
                chrome.runtime.sendMessage({ from: LAYER.CONTENT, to: LAYER.DEVTOOLS, data: initMessage(data.tabId) });
            }
        }
    });
}
