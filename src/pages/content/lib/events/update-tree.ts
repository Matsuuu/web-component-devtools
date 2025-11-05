import { ElementTreeMessage } from "@src/pages/messages/element-tree-message";
import { LAYER } from "@src/pages/messages/layers";
import { contentTreeState, getDOMTree } from "../tree-walker";

export function updateTree() {
    const tree = getDOMTree();
    contentTreeState.tree = tree;

    chrome.runtime.sendMessage({
        from: LAYER.CONTENT,
        to: LAYER.DEVTOOLS,
        data: new ElementTreeMessage(tree),
    });
}
