/**
 * @typedef UpdateData
 * @property {number} type
 * @property {number} index
 * @property {string} name
 * @property {any} value
 * @property {number} elementType
 * */

import { attributeIsBoolean, getCurrentSelectedElement } from "./crawler-utils";

/**
 * @param {UpdateData} updateData
 */
export function updateGenericComponentValue(updateData) {
    /** @type { HTMLElement } */
    const element = getCurrentSelectedElement();
    const isBoolean = attributeIsBoolean(updateData.value);

    if (isBoolean) {
        if (updateData.value) element.setAttribute(updateData.name, "");
        else element.removeAttribute(updateData.name);
    } else {
        if (updateData.value && updateData.value.length > 0)
            element.setAttribute(updateData.name, updateData.value);
        else element.removeAttribute(updateData.name);
    }
}

/**
 * @param {UpdateData} updateData
 */
export function updateLitElementValue(updateData) {
    const element = getCurrentSelectedElement();
    element[updateData.name] = updateData.value;
}

export const elementUpdatersInject = `
${updateGenericComponentValue.toString()}
${updateLitElementValue.toString()}
`;
