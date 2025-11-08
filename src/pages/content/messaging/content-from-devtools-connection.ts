import { isHoverLeaveMessage } from "@src/pages/messages/hover-leave-message";
import { isHoverMessage } from "@src/pages/messages/hover-message";
import { InitMessage, isInitMessage } from "@src/pages/messages/init-message";
import { CONTEXT, LAYER } from "@src/pages/messages/layers";
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

export function handleContentMessageFromDevtools(message: any): Promise<any> {
    const data = message.data;

    if (isInitMessage(data)) {
        contentConnectionsState.initialized = true;
        contentConnectionsState.tabId = data.tabId;

        browser.runtime.sendMessage({
            from: LAYER.CONTENT,
            to: LAYER.DEVTOOLS,
            data: new InitMessage(data.tabId),
        });

        window.postMessage({
            source: CONTEXT,
            from: LAYER.CONTENT,
            to: LAYER.INPAGE,
            data: new InitMessage(data.tabId),
        });

        updateTree();

        return Promise.resolve();
    }

    if (isHoverMessage(data)) {
        const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
        if (!hoveredElement) {
            return Promise.resolve();
        }

        const dimensions = getSpotlightElementDimensions(hoveredElement);

        moveSpotlight(dimensions);

        return Promise.resolve();
    }

    if (isHoverLeaveMessage(data)) {
        requestSpotlightRemove();

        return Promise.resolve();
    }

    return Promise.resolve();
}
