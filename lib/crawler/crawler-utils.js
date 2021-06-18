import { SELECTED_ELEMENT } from "./crawler-constants";

/**
 * @param {string} value
 */
export function attributeIsBoolean(value) {
    if (typeof value === "boolean") {
        return true;
    }
    if (value === "true" || value === "false") {
        return true;
    }
    if (value != null && value.length <= 0) {
        return true;
    }
    return false;
}


export function getCurrentSelectedElement() {
    return window[SELECTED_ELEMENT];
}

export const crawlerUtilsInject = `
${attributeIsBoolean.toString()}
${getCurrentSelectedElement.toString()}
`;
