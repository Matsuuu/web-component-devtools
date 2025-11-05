import { type UUID } from "crypto";
import { TreeElement } from "./element";

export const contentTreeState = {
    tree: undefined! as TreeElement,
    treeElementWeakMap: new WeakMap<Element, TreeElement>(),
    treeElementByIdMap: new Map<UUID, TreeElement>(),
};

/**
 * Runs through the whole DOM tree using the TreeWalker and
 * returns a single TreeElement which represents the top
 * Element, here being the Document Body.
 * */
export function getDOMTree(): TreeElement {
    const target = document.body;
    const tree = new TreeElement(target);

    contentTreeState.treeElementWeakMap.set(document.body, tree);

    parseDOMTree(target);

    return tree;
}

function parseDOMTree(target: HTMLElement | ShadowRoot = document.body) {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_ELEMENT, null);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node instanceof Element) {
            const treeElement = new TreeElement(node);

            contentTreeState.treeElementWeakMap.set(node, treeElement);
            contentTreeState.treeElementByIdMap.set(treeElement.id, treeElement);

            if (node.shadowRoot) {
                parseDOMTree(node.shadowRoot);
            }

            // Handle normal case, where we have a normal parent
            const parentElem = node.parentElement;
            if (parentElem) {
                const parent = contentTreeState.treeElementWeakMap.get(node.parentElement);
                if (parent) {
                    parent.addChild(treeElement);
                }
            } else {
                // Handle special cases, e.g. boreing into a Shadow Root
                if (node.parentNode && nodeIsShadowRoot(node.parentNode)) {
                    const parentHost = node.parentNode.host;
                    const parent = contentTreeState.treeElementWeakMap.get(parentHost);
                    if (parent) {
                        parent.addChild(treeElement);
                    }
                }
            }
        }
    }
}

function nodeIsShadowRoot(node: Node): node is ShadowRoot {
    return node.toString() === "[object ShadowRoot]";
}
