export class CustomElementNode {
    /**
     * @param {HTMLElement} element
     * @param {number} id
     * @param {CustomElementNode} parentTreeOrNode
     * @param {boolean} inShadow
     */
    constructor(element: HTMLElement, id: number, parentTreeOrNode: CustomElementNode, inShadow: boolean);
    /** @type { number } id */
    id: number;
    /** @type { string } tagName */
    tagName: string;
    /** @type { HTMLElement } element */
    element: HTMLElement;
    /** @type { CustomElementNode } parent */
    parent: CustomElementNode;
    /** @type { number | undefined } parentId */
    parentId: number | undefined;
    /** @type { Document } document */
    document: Document;
    /** @type { Node } */
    root: Node;
    /** @type { Array<CustomElementNode> } children */
    children: Array<CustomElementNode>;
    /** @type { Array<CustomElementNode> } siblings */
    siblings: Array<CustomElementNode>;
    /** @type { boolean } inShadowRoot */
    inShadowRoot: boolean;
    /** @type { boolean } isDefined */
    isDefined: boolean;
    /** @type { string } nodeText */
    nodeText: string;
    /**
     * @returns { import('./custom-element-tree.js').CustomElementNodeInMessageFormat }
     * */
    toMessageFormat(): import('./custom-element-tree.js').CustomElementNodeInMessageFormat;
    /**
     * @param {CustomElementNode} otherNode
     */
    isChildOf(otherNode: CustomElementNode): boolean;
    /**
     * @param {CustomElementNode} otherNode
     */
    isParentOf(otherNode: CustomElementNode): boolean;
    /**
     * @param {CustomElementNode} otherNode
     */
    isSiblingOf(otherNode: CustomElementNode): boolean;
    allChildren(): any[];
    /** @private */
    private _getChildren;
    /**
     * @param {boolean} [collapsed]
     */
    logNode(collapsed?: boolean): void;
}
