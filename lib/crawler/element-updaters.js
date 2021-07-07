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

import { getCurrentSelectedElement } from './crawler-utils';

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateGenericComponentValue(updateData, updateTarget) {
    /** @type { HTMLElement } */
    const element = getCurrentSelectedElement();
    const attributeOrPropertyName = updateData.attributeOrProperty.name;
    switch (updateTarget) {
        case 'attribute':
            const isBoolean = typeof updateData.value === 'boolean';
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
            let updateValue = updateData.value;
            // If we have the type in the known, we check if we need to cast/parse it
            if (updateData.attributeOrProperty.type) {
                switch (updateData.attributeOrProperty.type.text) {
                    case "number":
                        updateValue = parseFloat(updateValue);
                        break;
                }
            }

            if (!updateData.propertyPath || updateData.propertyPath.length <= 0) {
                element[attributeOrPropertyName] = updateValue;
            } else {
                let targetObject = element;
                while (updateData.propertyPath.length > 0) {
                    targetObject = targetObject[updateData.propertyPath.shift()];
                }
                targetObject[attributeOrPropertyName] = updateValue;
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

/**
 * @param {UpdateData} updateData
 * @param {string} updateTarget Property or Attribute
 */
export function updateAtomicoElementValue(updateData, updateTarget) {
    updateGenericComponentValue(updateData, updateTarget);

    if (updateTarget === 'property') {
        const element = getCurrentSelectedElement();
        element.update();
    }
}

export const elementUpdatersInject = `
${updateGenericComponentValue.toString()}
${updateLitElementValue.toString()}
${updateFastElementValue.toString()}
${updateAtomicoElementValue.toString()}
`;
