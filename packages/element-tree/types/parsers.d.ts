/**
 * @param {CustomElementTree | CustomElementNode} treeOrNode
 *
 * @returns { Array<CustomElementNode> }
 */
export function getElements(treeOrNode: CustomElementTree | CustomElementNode): Array<CustomElementNode>;
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
