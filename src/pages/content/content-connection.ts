import { WaTreeItem } from "@awesome.me/webawesome/dist/react";
import { isHoverLeaveMessage } from "../messages/hover-leave-message";
import { isHoverMessage } from "../messages/hover-message";
import { InitMessage, isInitMessage } from "../messages/init-message";
import { LAYER } from "../messages/layers";
import { RequestInitMessage } from "../messages/request-init-message";
import { isSelectMessage } from "../messages/select-message";
import { updateTree } from "./lib/events/update-tree";
import { getSpotlightElementDimensions } from "./lib/spotlight/dimensions";
import { getSpotlightElement, moveSpotlight, requestSpotlightRemove } from "./lib/spotlight/spotlight-element";
import { contentTreeState } from "./lib/tree-walker";

export function initConnection() {
    let initialized = false;

    chrome.runtime.onMessage.addListener((message, sender) => {
        const data = message.data;

        if (message.from === LAYER.DEVTOOLS) {
            console.log("Message from devtools: ", message);

            // TODO: At some point we might want to move these somewhere else.
            //
            // For now, let's just pile em here

            if (isInitMessage(data)) {
                initialized = true;
                console.log("Init received from Devtools, responding.");
                chrome.runtime.sendMessage({
                    from: LAYER.CONTENT,
                    to: LAYER.DEVTOOLS,
                    data: new InitMessage(data.tabId),
                });

                updateTree();
                return;
            }

            if (isHoverMessage(data)) {
                const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
                if (!hoveredElement) {
                    return;
                }

                const dimensions = getSpotlightElementDimensions(hoveredElement);

                moveSpotlight(dimensions);

                return;
            }

            if (isHoverLeaveMessage(data)) {
                const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
                requestSpotlightRemove();

                return;
            }

            if (isSelectMessage(data)) {
                console.log("Element selected: ", data.element);
                console.warn("Element selection not yet implemented");
            }
        }
    });

    setTimeout(() => {
        if (!initialized) {
            chrome.runtime.sendMessage({
                from: LAYER.CONTENT,
                to: LAYER.DEVTOOLS,
                data: new RequestInitMessage(),
            });
        }
    }, 1000);
}
