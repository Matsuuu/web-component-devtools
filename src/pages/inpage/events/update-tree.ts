import { getDOMTree, contentTreeState } from "../../../pages/content/lib/tree-walker";
import { ElementTreeMessage } from "../../..//pages/messages/element-tree-message";
import { LAYER } from "../../../pages/messages/layers";
import { sendMessageFromInPage } from "../inpage-connections";

export function updateTree() {
    const tree = getDOMTree();
    contentTreeState.tree = tree;

    sendMessageFromInPage({
        to: LAYER.DEVTOOLS,
        data: new ElementTreeMessage(tree),
    });
}
