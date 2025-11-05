import { TreeElement } from "./element";

/**
 * Runs through the whole DOM tree using the TreeWalker and
 * returns a single TreeElement which represents the top
 * Element, here being the Document Body.
 * */
export function getDOMTree(): TreeElement {
    const treeElementWeakMap = new WeakMap<Element, TreeElement>();
    const target = document.body;
    const tree = new TreeElement(target);

    treeElementWeakMap.set(document.body, tree);

    parseDOMTree(target, treeElementWeakMap);

    return tree;
}

function parseDOMTree(
    target: HTMLElement | ShadowRoot = document.body,
    treeElementWeakMap: WeakMap<Element, TreeElement>,
) {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_ELEMENT, null);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node instanceof Element) {
            const treeElement = new TreeElement(node);
            treeElementWeakMap.set(node, treeElement);

            if (node.shadowRoot) {
                parseDOMTree(node.shadowRoot, treeElementWeakMap);
            }

            // Handle normal case, where we have a normal parent
            const parentElem = node.parentElement;
            if (parentElem) {
                const parent = treeElementWeakMap.get(node.parentElement);
                if (parent) {
                    parent.addChild(treeElement);
                }
            } else {
                // Handle special cases, e.g. boreing into a Shadow Root
                if (node.parentNode && nodeIsShadowRoot(node.parentNode)) {
                    const parentHost = node.parentNode.host;
                    const parent = treeElementWeakMap.get(parentHost);
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
