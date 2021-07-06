/**
 * @typedef UpdateData
 * @property {number} type
 * @property {number} index
 * @property {string} name
 * @property {any} value
 * @property {number} elementType
 * @property {import('custom-elements-manifest/schema').PropertyLike | import('custom-elements-manifest/schema').Attribute} attributeOrProperty
 * @property {Array<String>} propertyPath
 */

import { attributeIsBoolean, getCurrentSelectedElement } from './crawler-utils';

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateGenericComponentValue(updateData, updateTarget) {
    /** @type { HTMLElement } */
    const element = getCurrentSelectedElement();
    const attributeOrProperty = updateData.attributeOrProperty;
    const attributeOrPropertyName = updateData.attributeOrProperty.name;
    switch (updateTarget) {
        case 'attribute':
            const isBoolean = attributeIsBoolean(element, attributeOrProperty);
            if (isBoolean) {
                if (updateData.value) element.setAttribute(attributeOrPropertyName, '');
                else element.removeAttribute(attributeOrPropertyName);
            } else {
                if (updateData.value && updateData.value.length > 0)
                    element.setAttribute(attributeOrPropertyName, updateData.value);
                else element.removeAttribute(attributeOrPropertyName);
            }
            break;
        case 'property':
            if (!updateData.propertyPath || updateData.propertyPath.length <= 0) {
                element[attributeOrPropertyName] = updateData.value;
            } else {
                let targetObject = element;
                while (updateData.propertyPath.length > 0) {
                    targetObject = targetObject[updateData.propertyPath.shift()];
                }
                targetObject[attributeOrPropertyName] = updateData.value;
            }
            break;
    }
}

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateLitElementValue(updateData, updateTarget) {
    updateGenericComponentValue(updateData, updateTarget);

    if (updateTarget === 'property') {
        const element = getCurrentSelectedElement();
        element.requestUpdate();
    }
}

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateFastElementValue(updateData, updateTarget) {
    updateGenericComponentValue(updateData, updateTarget);
}

export const elementUpdatersInject = `
${updateGenericComponentValue.toString()}
${updateLitElementValue.toString()}
${updateFastElementValue.toString()}
`;
