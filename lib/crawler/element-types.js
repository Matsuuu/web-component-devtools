/**
 * @typedef ElementTypeMap
 * @type {Object.<string, ElementType>}
 *
 * @callback ParserCallback
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementData
 *
 * @callback OnUpdateCallback
 * @param {import("./element-updaters").UpdateData} UpdateData
 * @param {string} updateTarget Attribute or Property
 *
 * @typedef ElementType
 * @property {number} id
 * @property {ParserCallback} parser
 * @property {OnUpdateCallback} onUpdate
 * */

import { parseFastElement, parseGenericComponent, parseLitElement } from './element-parsers';
import { updateFastElementValue, updateGenericComponentValue, updateLitElementValue } from './element-updaters';

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
 * @param {HTMLElement} element
 */
export function determineElementType(customElementDeclaration, element) {
    if (hasLitProperties(customElementDeclaration)) return ELEMENT_TYPES.LIT;
    if (hasFastElementProperties(element)) return ELEMENT_TYPES.FAST;

    return ELEMENT_TYPES.VANILLA;
}

/**
 * @param {any} customElementDeclaration
 */
export function hasLitProperties(customElementDeclaration) {
    // elementProperties is lit 2.0, and _classproperties is lit < 2.0
    return (
        typeof customElementDeclaration.elementProperties !== 'undefined' ||
        typeof customElementDeclaration._classProperties !== 'undefined'
    );
}

/**
 * @param {any} element
 */
export function hasFastElementProperties(element) {
    return typeof element.$fastController !== 'undefined';
}

export const elementTypesInject = `
${getElementTypeById.toString()}
${determineElementType.toString()}
${hasLitProperties.toString()}
${hasFastElementProperties.toString()}

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
    FAST: {
        id: 2,
        parser: parseFastElement,
        onUpdate: updateFastElementValue
    }
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
    FAST: {
        id: 2,
        parser: parseFastElement,
        onUpdate: updateFastElementValue,
    },
};
