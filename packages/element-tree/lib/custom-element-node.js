import { getElements } from "./parsers";

export class CustomElementNode {
    /**
     * @param {HTMLElement} element
     * @param {number} id
     * @param {CustomElementNode} parentTreeOrNode
     * @param {boolean} inShadow
     */
    constructor(element, id, parentTreeOrNode, inShadow) {
        /** @type { number } id */
        this.id = id;
        /** @type { string } tagName */
        this.tagName = element.tagName;
        /** @type { HTMLElement } element */
        this.element = element;
        /** @type { CustomElementNode } parent */
        this.parent = parentTreeOrNode;
        /** @type { number | undefined } parentId */
        this.parentId =
            parentTreeOrNode instanceof CustomElementNode
                ? parentTreeOrNode.id
                : undefined;
        /** @type { Document } document */
        this.document = this.element.ownerDocument;
        /** @type { Node } */
        this.root = this.element.getRootNode();
        /** @type { Array<CustomElementNode> } children */
        this.children = [];
        /** @type { Array<CustomElementNode> } siblings */
        this.siblings = [];
        /** @type { boolean } inShadowRoot */
        this.inShadowRoot = inShadow;

        this._getChildren();
    }

    /**
     * @param {CustomElementNode} otherNode
     */
    isChildOf(otherNode) {
        return otherNode.isParentOf(this);
    }

    /**
     * @param {CustomElementNode} otherNode
     */
    isParentOf(otherNode) {
        const parentNodes = [];
        let par = otherNode.parent;
        while (par) {
            parentNodes.push(par);
            if (par === this) break;
            par = par.parent;
        }
        return parentNodes.includes(this);
    }

    /**
     * @param {CustomElementNode} otherNode
     */
    isSiblingOf(otherNode) {
        return otherNode.siblings.some(sib => sib === this);
    }

    allChildren() {
        const allChildren = [];
        this.children.forEach(c => {
            allChildren.push(c);
            c.allChildren().forEach(cc => {
                allChildren.push(cc);
            });
        });
        return allChildren;
    }

    /** @private */
    _getChildren() {
        this.children = getElements(this);
    }

    /**
     * @param {boolean} [collapsed]
     */
    logNode(collapsed) {
        if (collapsed) {
            console.groupCollapsed(this.element);
        } else {
            console.group(this.element);
        }
        console.groupCollapsed("Data");
        Object.entries(this).forEach((entry) => console.log(entry[0], entry[1]));
        console.groupEnd();
        this.children.forEach((child) => child.logNode());
        console.groupEnd();
    }
}
