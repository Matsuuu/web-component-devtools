import { SELECTED_ELEMENT } from './crawler-constants';
import { getCustomElementNodeForElement } from './element-finder';

export function getCurrentSelectedElement() {
    return window[SELECTED_ELEMENT];
}

export function getCurrentSelectedElementNode() {
    return getCustomElementNodeForElement(window[SELECTED_ELEMENT]);
}

/**
 * Check if element is defined in the window context it is
 * placed into. This needs to be done since the element could be inside a
 * iframe.
 *
 * @param {HTMLElement} element
 */
export function elementIsDefined(element) {
    const elementDocument = element?.ownerDocument;
    const elementWindow = elementDocument.defaultView;

    return typeof elementWindow.customElements.get(element.nodeName.toLowerCase()) !== 'undefined';
}

/**
 * @param {HTMLElement} element
 */
export function getElementDeclaration(element) {
    const elementDocument = element?.ownerDocument;
    const elementWindow = elementDocument?.defaultView;
    return elementWindow?.customElements?.get(element.nodeName.toLowerCase()) ?? '';
}

/**
 * @param {Function} callback
 */
export function throttle(callback) {
    if (crawlerIsThrottling) return;
    crawlerIsThrottling = true;
    setTimeout(() => {
        callback();
        crawlerIsThrottling = false;
    }, 250);
}

export function throttlePromise() {
    return new Promise(resolve => setTimeout(resolve, 250));
}

/**
 * @param {Node | Element} node
 */
export function buildNodeText(node) {
    let nodeText = `<${node.nodeName.toLowerCase()}`;
    // @ts-ignore
    const attributes = node.attributes ?? [];
    for (const attr of attributes) {
        let val = attr.value;
        if (val != null && val.length === 0) {
            val = '';
        } else {
            val = `="${attr.value}"`;
        }
        nodeText += ` ${attr.name}${val}`;
    }
    nodeText += '>';
    return nodeText;
}

export function buildFunctionText(fun) {
    return 'ƒ ' + fun;
}

/**
 * @param {Element} el
 */
function elementIsPossiblyCustomElement(el) {
    return el.nodeName.includes("-");
}

/**
 * Access to element's properties can be denied by some browsers/contexts.
 * Due to this, we need to abstract these calls and checks into functions.
 *
 * @param {Element} el
 */
export function elementHasShadowRoot(el) {
    try {
        return elementIsPossiblyCustomElement(el) && el.shadowRoot !== undefined && el.shadowRoot !== null;
    } catch (ex) {
        return false;
    }
}

/**
 * @param {Element} el
 */
export function getElementNodeName(el) {
    try {
        return el.nodeName;
    } catch (ex) {
        return '';
    }
}

let crawlerIsThrottling = false;
