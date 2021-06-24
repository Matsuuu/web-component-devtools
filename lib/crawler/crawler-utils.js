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

export const crawlerUtilsInject = `
${attributeIsBoolean.toString()}
${getCurrentSelectedElement.toString()}
`;
