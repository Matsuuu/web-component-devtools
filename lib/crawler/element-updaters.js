/**
 * @typedef UpdateData
 * @property {number} type
 * @property {number} index
 * @property {string} key
 * @property {any} value
 * @property {number} elementType
 * */

import { attributeIsBoolean } from "./crawler-utils";
import { getCurrentSelectedElement } from "./element-finder";

/**
 * @param {UpdateData} updateData
 */
export function updateGenericComponentValue(updateData) {
    /** @type { HTMLElement } */
    const element = getCurrentSelectedElement();
    const isBoolean = attributeIsBoolean(updateData.value);

    if (isBoolean) {
        if (updateData.value) element.setAttribute(updateData.key, "");
        else element.removeAttribute(updateData.key);
    } else {
        if (updateData.value && updateData.value.length > 0)
            element.setAttribute(updateData.key, updateData.value);
        else element.removeAttribute(updateData.key);
    }
}

/**
 * @param {UpdateData} updateData
 */
export function updateLitElementValue(updateData) {
    const element = getCurrentSelectedElement();
    element[updateData.key] = updateData.value;
}

export const elementUpdatersInject = `
${updateGenericComponentValue.toString()}
${updateLitElementValue.toString()}
`;
