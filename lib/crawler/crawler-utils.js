import { ELEMENT_TYPES } from "./element-types.js";

/**
 * @param {any} customElementDeclaration
 */
export function determineElementType(customElementDeclaration) {
    if (hasLitProperties(customElementDeclaration)) return ELEMENT_TYPES.LIT;

    return ELEMENT_TYPES.VANILLA;
}

/**
 * @param {{ _classProperties: any; }} customElementDeclaration
 */
export function hasLitProperties(customElementDeclaration) {
    return typeof customElementDeclaration._classProperties !== "undefined";
}

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

export const crawlerUtilsInject = `
${determineElementType.toString()}
${hasLitProperties.toString()}
${attributeIsBoolean.toString()}
`;
