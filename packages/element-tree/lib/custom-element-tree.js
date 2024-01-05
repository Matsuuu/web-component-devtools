import { CustomElementNode } from './custom-element-node';
import { logElementTree } from './loggers';
import { getElements } from './parsers';

/**
 * @typedef CustomElementTreeInMessageFormat
 * @property { number } elementCount
 * @property { Array<CustomElementNodeInMessageFormat> } elements
 * */

/**
 * @typedef CustomElementNodeInMessageFormat
 * @property { number } id
 * @property { string } tagName
 * @property { number } parentId
 * @property { Array<CustomElementNodeInMessageFormat> } children
 * @property { boolean } isDefined
 * @property { string } nodeText
 * */


export class CustomElementTree {
    /**
     * @param {string[]} ignoredElements
     */
    constructor(dom = document.body, ignoredElements = []) {
        /** @type { number } */
        this.elementCount = 0;
        /** @type { Array<CustomElementNode> } */
        this.elements = [];

        this.element = dom;

        const usableIgnoredElements = ignoredElements.map(ie => ie.toLowerCase());

        this._findElements(usableIgnoredElements);
    }

    /**
     * @param {string[]} ignoredElements
     */
    _findElements(ignoredElements) {
        this.elements = getElements(this, ignoredElements);
        this.elementCount = this.flat().length;
    }

    toMessageFormat() {
        return {
            elementCount: this.elementCount,
            elements: this.elements.map(el => el.toMessageFormat()),
        };
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
            elementNode.children.forEach(el => {
                elementArray.push(el);
                getChildren(elementArray, el);
            });
        }
        const elements = [];
        this.elements.forEach(e => {
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
            console.groupCollapsed('Custom Element Tree');
        } else {
            console.group('Custom Element Tree');
        }
        console.log('Elements #: ', this.elementCount);
        this.elements.forEach(el => el.logNode());
        console.groupEnd();
    }
}
