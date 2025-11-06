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
import browser from "webextension-polyfill";

let isInitialized = false;
let lastInitTimestamp = 0;
const INIT_DEBOUNCE_MS = 1000;

function handleMessage(message: any, sender: any): boolean | void {
    const data = message.data;

    if (message.from !== LAYER.DEVTOOLS) {
        return;
    }

    if (isInitMessage(data)) {
        isInitialized = true;
        const now = Date.now();
        if (now - lastInitTimestamp < INIT_DEBOUNCE_MS) {
            return true;
        }

        lastInitTimestamp = now;

        browser.runtime.sendMessage({
            from: LAYER.CONTENT,
            to: LAYER.DEVTOOLS,
            data: new InitMessage(data.tabId),
        });

        updateTree();
        return true;
    }

    if (isHoverMessage(data)) {
        const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
        if (!hoveredElement) {
            return true;
        }

        const dimensions = getSpotlightElementDimensions(hoveredElement);
        moveSpotlight(dimensions);
        return true;
    }

    if (isHoverLeaveMessage(data)) {
        requestSpotlightRemove();
        return true;
    }
}

export function initConnection() {
    if (isInitialized) {
        return;
    }

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
