import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { updateTree } from "./lib/events/update-tree";

export function initConnection() {
    chrome.runtime.onMessage.addListener((message, sender) => {
        const data = message.data;

        if (message.from === LAYER.DEVTOOLS) {
            if (isInitMessage(data)) {
                console.log("Init received from Devtools, responding.");
                chrome.runtime.sendMessage({
                    from: LAYER.CONTENT,
                    to: LAYER.DEVTOOLS,
                    data: new InitMessage(data.tabId),
                });

                updateTree();
            }
        }
    });
}
