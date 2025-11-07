import { isHoverLeaveMessage } from "@src/pages/messages/hover-leave-message";
import { isHoverMessage } from "@src/pages/messages/hover-message";
import { InitMessage, isInitMessage } from "@src/pages/messages/init-message";
import { LAYER } from "@src/pages/messages/layers";
import { isSelectMessage } from "@src/pages/messages/select-message";
import { updateTree } from "../lib/events/update-tree";
import { getSpotlightElementDimensions } from "../lib/spotlight/dimensions";
import { moveSpotlight, requestSpotlightRemove } from "../lib/spotlight/spotlight-element";
import { contentTreeState } from "../lib/tree-walker";
import browser from "webextension-polyfill";
import { contentConnectionsState } from "./content-connection";

// TODO: Maybe put each of these code paths into their own functions too?
//
// Maybe even create an engine where we could have an map with key being the checker, value being the callback function?
// -- Too complex for no upside?

export function handleContentMessageFromDevtools(message: any) {
    console.log("Message from devtools: ", message);
    const data = message.data;

    if (isInitMessage(data)) {
        contentConnectionsState.initialized = true;
        console.log("Init received from Devtools, responding.");
        browser.runtime.sendMessage({
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
        requestSpotlightRemove();

        return;
    }

    if (isSelectMessage(data)) {
        console.log("Element selected: ", data.element);
        console.warn("Element selection not yet implemented");
    }
}
