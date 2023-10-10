import { CustomElementNode } from "./custom-element-node";
import { logElementTree } from "./loggers";
import { getElements } from "./parsers";

export class CustomElementTree {
    constructor(dom = document.body) {
        /** @type { number } */
        this.elementCount = 0;
        /** @type { Array<CustomElementNode> } */
        this.elements = [];

        this.element = dom;

        this._findElements();
    }

    _findElements() {
        this.elements = getElements(this);
        this.elementCount = this.flat().length;
    }

    /**
     * Returns a flat representation of the CustomElementTree
     * */
    flat() {
        /**
         * @param {Array<CustomElementNode>} elementArray
         * @param {CustomElementNode} elementNode
         */
        function getChildren(elementArray, elementNode) {
            elementNode.children.forEach((el) => {
                elementArray.push(el);
                getChildren(elementArray, el);
            });
        }
        const elements = [];
        this.elements.forEach((e) => {
            elements.push(e);
            getChildren(elements, e);
        });

        return elements;
    }

    logTree() {
        logElementTree(this);
    }

    logTreeCollapsed() {
        logElementTree(this, true);
    }

    /**
     * @param {boolean} collapsed
     */
    _log(collapsed) {
        if (collapsed) {
            console.groupCollapsed("Custom Element Tree");
        } else {
            console.group("Custom Element Tree");
        }
        console.log("Elements #: ", this.elementCount);
        this.elements.forEach((el) => el.logNode());
        console.groupEnd();
    }
}
