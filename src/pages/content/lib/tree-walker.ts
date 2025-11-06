import { TreeElement } from "./element";

type TreeState = {
    tree?: TreeElement;
    treeElementWeakMap: WeakMap<Element, TreeElement>;
    treeElementByIdMap: Map<string, TreeElement>;
};

export const contentTreeState: TreeState = {
    treeElementWeakMap: new WeakMap<Element, TreeElement>(),
    treeElementByIdMap: new Map<string, TreeElement>(),
};

/**
 * Runs through the whole DOM tree using the TreeWalker and
 * returns a single TreeElement which represents the top
 * Element, here being the Document Body.
 * */
export function getDOMTree(): TreeElement {
    const target = document.body;
    
    let tree: TreeElement;
    try {
        tree = new TreeElement(target);
    } catch (error) {
        console.error("getDOMTree: Error creating TreeElement for body:", error);
        throw error;
    }

    contentTreeState.treeElementWeakMap.set(document.body, tree);
    contentTreeState.treeElementByIdMap.set(tree.id, tree);

    try {
        parseDOMTree(target);
    } catch (error) {
        console.error("getDOMTree: Error in parseDOMTree:", error);
        throw error;
    }

    return tree;
}

function parseDOMTree(target: HTMLElement | ShadowRoot = document.body) {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_ELEMENT, null);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        
        if (node instanceof Element) {
            try {
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
            } catch (error) {
                console.error("parseDOMTree: Error processing node:", node, error);
            }
        }
    }
}

function nodeIsShadowRoot(node: Node): node is ShadowRoot {
    return node.toString() === "[object ShadowRoot]";
}
