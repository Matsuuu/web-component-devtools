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
    constructor(dom?: HTMLElement, ignoredElements?: string[]);
    /** @type { number } */
    elementCount: number;
    /** @type { Array<CustomElementNode> } */
    elements: Array<CustomElementNode>;
    element: HTMLElement;
    /**
     * @param {string[]} ignoredElements
     */
    _findElements(ignoredElements: string[]): void;
    toMessageFormat(): {
        elementCount: number;
        elements: CustomElementNodeInMessageFormat[];
    };
    /**
     * Returns a flat representation of the CustomElementTree
     * */
    flat(): any[];
    logTree(): void;
    logTreeCollapsed(): void;
    /**
     * @param {boolean} collapsed
     */
    _log(collapsed: boolean): void;
}
export type CustomElementTreeInMessageFormat = {
    elementCount: number;
    elements: Array<CustomElementNodeInMessageFormat>;
};
export type CustomElementNodeInMessageFormat = {
    id: number;
    tagName: string;
    parentId: number;
    children: Array<CustomElementNodeInMessageFormat>;
    isDefined: boolean;
    nodeText: string;
};
import { CustomElementNode } from './custom-element-node';
