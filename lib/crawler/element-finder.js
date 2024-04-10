import { CustomElementTree } from 'custom-element-tree';
import { FOUND_ELEMENTS } from './crawler-constants.js';

export function findElementsOnPage() {
    const tree = new CustomElementTree(undefined, ["wc-devtools-spotlight-border"]);

    window[FOUND_ELEMENTS] = tree.flat();

    return tree;
}

export function getCachedFoundElements() {
    return window[FOUND_ELEMENTS];
}

/**
 * @param {number} id
 * @returns { HTMLElement }
 */
export function getElementById(id) {
    const elements = window[FOUND_ELEMENTS];

    const spotlitElement = elements?.find(el => el.id === id)?.element;
    return spotlitElement;
}

/**
 * @param {HTMLElement} element
 */
export function getCustomElementNodeForElement(element) {
    return (window[FOUND_ELEMENTS] ?? []).find(entry => entry.element === element);
}
