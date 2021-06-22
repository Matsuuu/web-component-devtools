/**
 * @typedef ElementTypeMap
 * @type {Object.<string, ElementType>}
 *
 * @callback ParserCallback
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementState
 *
 * @callback OnUpdateCallback
 * @param {import("./element-updaters").UpdateData} UpdateData
 *
 * @typedef ElementType
 * @property {number} id
 * @property {ParserCallback} parser
 * @property {OnUpdateCallback} onUpdate
 * */

import { parseGenericComponent, parseLitElement } from "./element-parsers";
import {
    updateGenericComponentValue,
    updateLitElementValue,
} from "./element-updaters";


/**
 * @param {number} id
 */
export function getElementTypeById(id) {
    for (const [_, val] of Object.entries(ELEMENT_TYPES)) {
        if (val.id === id) return val;
    }
    return null;
}


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

export const elementTypesInject = `
${getElementTypeById.toString()}
${determineElementType.toString()}
${hasLitProperties.toString()}

const ELEMENT_TYPES = {
    VANILLA: {
        id: 0,
        parser: parseGenericComponent,
        onUpdate: updateGenericComponentValue,
    },
    LIT: {
        id: 1,
        parser: parseLitElement,
        onUpdate: updateLitElementValue,
    },
};
`;

/**
 * Copy the values here into the elementTypesInject export in string
 * format so that they get copied to client side
 *
 *   @type ElementTypeMap
 * */
export const ELEMENT_TYPES = {
    VANILLA: {
        id: 0,
        parser: parseGenericComponent,
        onUpdate: updateGenericComponentValue,
    },
    LIT: {
        id: 1,
        parser: parseLitElement,
        onUpdate: updateLitElementValue,
    },
};
