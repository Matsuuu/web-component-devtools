import { SELECTED_ELEMENT } from './crawler-constants';

/**
 * Quite a process-of-elimination way of detemining if the value, or the
 * wanted value of the field is a boolean
 *
 * @param {HTMLElement} element
 * @param {import("custom-elements-manifest/schema").Attribute} [attribute]
 */
export function attributeIsBoolean(element, attribute) {
    if (attribute.type && attribute.type.text === 'boolean') return true;

    const value = element.getAttribute(attribute.name);
    if (element.hasAttribute(attribute.name) && value === '') return true;
    if (typeof value === 'boolean') return true;
    if (value === 'true' || value === 'false') return true;
    if (value != null && value.length <= 0) return true;

    return false;
}

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
${attributeIsBoolean.toString()}
${getCurrentSelectedElement.toString()}
${elementIsDefined.toString()}
${getElementDeclaration.toString()}
`;
