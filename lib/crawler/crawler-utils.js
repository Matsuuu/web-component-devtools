import { SELECTED_ELEMENT } from './crawler-constants';

export function getCurrentSelectedElement() {
    return window[SELECTED_ELEMENT];
}

/**
 * Check if element is defined in the window context it is
 * placed into. This needs to be done since the element could be inside a
 * iframe.
 *
 * @param {HTMLElement} element
 */
export function elementIsDefined(element) {
    const elementDocument = element.ownerDocument;
    const elementWindow = elementDocument.defaultView;

    return typeof elementWindow.customElements.get(element.nodeName.toLowerCase()) !== 'undefined';
}

/**
 * @param {HTMLElement} element
 */
export function getElementDeclaration(element) {
    const elementDocument = element.ownerDocument;
    const elementWindow = elementDocument.defaultView;
    return elementWindow.customElements.get(element.nodeName.toLowerCase());
}

export const crawlerUtilsInject = `
${getCurrentSelectedElement.toString()}
${elementIsDefined.toString()}
${getElementDeclaration.toString()}
`;
