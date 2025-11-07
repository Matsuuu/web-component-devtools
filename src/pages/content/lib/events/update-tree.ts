import { ElementTreeMessage } from "@src/pages/messages/element-tree-message";
import { LAYER } from "@src/pages/messages/layers";
import { contentTreeState, getDOMTree } from "../tree-walker";
import browser from "webextension-polyfill";

export function updateTree() {
    const tree = getDOMTree();
    contentTreeState.tree = tree;

    const message = {
        from: LAYER.CONTENT,
        to: LAYER.DEVTOOLS,
        data: new ElementTreeMessage(tree),
    };

    browser.runtime.sendMessage(message).catch(
        (error) => console.error("Content: Error sending tree message:", error)
    );
}
