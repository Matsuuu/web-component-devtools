import { CustomElementNode } from "./custom-element-node";
import { CustomElementTree } from "./custom-element-tree";

var randomIdArray;

/**
 * @returns { IterableIterator<number> }
 * */
function getRandomIdArray() {
    if (!randomIdArray) {
        const uintArray = new Uint32Array(9999); // Should be enough
        window.crypto.getRandomValues(uintArray);
        randomIdArray = uintArray.values();
    }
    return randomIdArray;
}

/**
 * @param {CustomElementTree | CustomElementNode} treeOrNode
 *
 * @returns { Array<CustomElementNode> }
 */
export function getElements(treeOrNode) {
    /** @type { Array<CustomElementNode> } */
    const elements = [];
    /** @type { NodeListOf<HTMLElement | HTMLIFrameElement> } */
    const lightDomElements = treeOrNode.element.querySelectorAll("*");
    /** @type { NodeListOf<HTMLElement | HTMLIFrameElement> | undefined } */
    const shadowDomElements = treeOrNode.element.shadowRoot
        ? treeOrNode.element?.shadowRoot.querySelectorAll("*")
        : undefined;

    const ids = getRandomIdArray();

    const allElements = new Array(
        lightDomElements.length + (shadowDomElements?.length ?? 0)
    );
    addElements(elements, lightDomElements, allElements, ids, treeOrNode, false);
    addElements(elements, shadowDomElements, allElements, ids, treeOrNode, true);

    elements.forEach(elem => {
        const siblings = getSiblings(elem, elements);
        elem.siblings = siblings;
    });

    return elements.filter(
        (el) =>
            !elementIsInsideChildComponent(
                treeOrNode.element,
                allElements,
                el.element
            )
    );
}

/**
 * @param {CustomElementNode} elementNode
 * @param {Array<CustomElementNode>} otherElements
 *
 * @returns {Array<CustomElementNode>}
 */
function getSiblings(elementNode, otherElements) {
    const siblings = [];
    let prev = elementNode.element.previousElementSibling;
    while (prev) {
        const siblingNode = otherElements.find((oe) => oe.element === prev);
        if (siblingNode) {
            siblings.push(siblingNode);
        }
        prev = prev.previousElementSibling;
    }
    let next = elementNode.element.nextElementSibling;
    while (next) {
        const siblingNode = otherElements.find((oe) => oe.element === next);
        if (siblingNode) {
            siblings.push(siblingNode);
        }
        next = next.nextElementSibling;
    }
    return siblings;
}

/**
 * @param {Array<CustomElementNode>} elementsArray
 * @param {NodeListOf<HTMLElement | HTMLIFrameElement> | CustomElementNode[]} elements
 * @param {Array<CustomElementNode>} allElements
 * @param {IterableIterator<number>} randomIds
 * @param {CustomElementTree | CustomElementNode} treeOrNode
 * @param {boolean} isShadow
 */
function addElements(
    elementsArray,
    elements,
    allElements,
    randomIds,
    treeOrNode,
    isShadow
) {
    const parent = treeOrNode instanceof CustomElementNode ? treeOrNode : undefined;
    elements?.forEach((elem) => {
        if (elementIsDefined(elem)) {
            elementsArray.push(
                new CustomElementNode(
                    elem,
                    randomIds.next().value,
                    parent,
                    isShadow
                )
            );
            allElements.push(elem);
        }
        if (elem instanceof HTMLIFrameElement) {
            try {
                // @ts-ignore
                getElements({ element: elem.contentWindow.document }).forEach((e) => {
                    elementsArray.push(e);
                    allElements.push(e);
                });
            } catch (_ignored) {
                // Ignore error. This happens if we can't access the iframe
            }
        }
    });
}

/**
 * @param {HTMLElement} parentElem
 * @param {Array<HTMLElement>} allElements
 * @param {HTMLElement} element
 */
function elementIsInsideChildComponent(parentElem, allElements, element) {
    let isInside = false;
    let el = element.parentElement ?? element.getRootNode()?.host ?? null;
    while (el && el !== parentElem) {
        if (el.nodeName.includes("-")) {
            isInside = true;
            break;
        }
        el = el.parentElement;
    }
    return isInside;
}

/**
 * @param {HTMLElement} element
 */
function elementIsDefined(element) {
    const elementDocument = element.ownerDocument;
    const elementWindow = elementDocument.defaultView;

    const tagName = element.tagName.toLowerCase();
    return typeof elementWindow.customElements.get(tagName) !== "undefined";
}
