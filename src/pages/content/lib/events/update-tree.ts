import { ElementTreeMessage } from "@src/pages/messages/element-tree-message";
import { LAYER } from "@src/pages/messages/layers";
import { getDOMTree } from "../tree-walker";

export function updateTree() {
    const tree = getDOMTree();

    chrome.runtime.sendMessage({
        from: LAYER.CONTENT,
        to: LAYER.DEVTOOLS,
        data: new ElementTreeMessage(tree),
    });
}
