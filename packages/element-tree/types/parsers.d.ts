/**
 * @param {CustomElementTree | CustomElementNode} treeOrNode
 * @param {string[]} ignoredElements
 *
 * @returns { Array<CustomElementNode> }
 */
export function getElements(treeOrNode: CustomElementTree | CustomElementNode, ignoredElements: string[]): Array<CustomElementNode>;
/**
 * @param {HTMLElement} element
 */
export function elementIsDefined(element: HTMLElement): boolean;
/**
 * @param {Node | Element} node
 */
export function buildNodeText(node: Node | Element): string;
import { CustomElementTree } from "./custom-element-tree";
import { CustomElementNode } from "./custom-element-node";
