/**
 * @typedef UpdateData
 * @property {number} type
 * @property {number} index
 * @property {string} name
 * @property {any} value
 * @property {number} elementType
 * */

import { attributeIsBoolean, getCurrentSelectedElement } from './crawler-utils';

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateGenericComponentValue(updateData, updateTarget) {
    /** @type { HTMLElement } */
    const element = getCurrentSelectedElement();
    switch (updateTarget) {
        case 'attribute':
            const isBoolean = attributeIsBoolean(updateData.value); //TODO(Matsuuu): Update these to utilize the DevToolsElement type
            if (isBoolean) {
                if (updateData.value) element.setAttribute(updateData.name, '');
                else element.removeAttribute(updateData.name);
            } else {
                if (updateData.value && updateData.value.length > 0)
                    element.setAttribute(updateData.name, updateData.value);
                else element.removeAttribute(updateData.name);
            }
            break;
        case 'property':
            element[updateData.name] = updateData.value;
            break;
    }
}

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateLitElementValue(updateData, updateTarget) {
    updateGenericComponentValue(updateData, updateTarget);
}

export const elementUpdatersInject = `
${updateGenericComponentValue.toString()}
${updateLitElementValue.toString()}
`;
