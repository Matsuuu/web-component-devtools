import { CustomElementNode } from "./custom-element-node";
import { CustomElementTree } from "./custom-element-tree";

/**
 * @param {CustomElementTree | CustomElementNode} treeOrNode
 * @param {boolean} [collapsed]
 */
export function logElementTree(treeOrNode, collapsed = false) {
    if (treeOrNode instanceof CustomElementTree) {
        treeOrNode._log(collapsed);
    } else {
        treeOrNode.logNode(collapsed);
    }
}
