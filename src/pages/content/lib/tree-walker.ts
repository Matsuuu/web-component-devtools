import { TreeElement } from "./element";

/**
 * Runs through the whole DOM tree using the TreeWalker and
 * returns a single TreeElement which represents the top
 * Element, here being the Document Body.
 * */
export function getDOMTree(): TreeElement {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);

    const tree = new TreeElement(document.body);
    const treeElementWeakMap = new WeakMap<Element, TreeElement>();

    treeElementWeakMap.set(document.body, tree);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node instanceof Element) {
            const treeElement = new TreeElement(node);
            treeElementWeakMap.set(node, treeElement);

            const parentElem = node.parentElement;
            if (parentElem) {
                const parent = treeElementWeakMap.get(node.parentElement);
                if (parent) {
                    parent.addChild(treeElement);
                }
            }
        }
    }

    return tree;
}
