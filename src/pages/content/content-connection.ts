import { ElementTreeMessage } from "../messages/element-tree-message";
import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { getDOMTree } from "./lib/tree-walker";

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

                const tree = getDOMTree();
                console.log("Sending tree ", tree);
                chrome.runtime.sendMessage({
                    from: LAYER.CONTENT,
                    to: LAYER.DEVTOOLS,
                    data: new ElementTreeMessage(tree),
                });
            }
        }
    });
}
