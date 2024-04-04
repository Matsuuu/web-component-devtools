/**
 * @typedef ElementTypeMap
 * @type {Object.<string, ElementType>}
 *
 * @callback ParserCallback
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {import('../types/devtools-element').DevToolsElement} elementData
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

import {
    parseAtomicoElement,
    parseFastElement,
    parseGenericComponent,
    parseLitElement,
    parsePolymerElement,
    parseAngularElement
} from './element-parsers';
import {
    updateAtomicoElementValue,
    updateFastElementValue,
    updateGenericComponentValue,
    updateLitElementValue,
    updatePolymerElementValue,
    updateAngularElementValue
} from './element-updaters';

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
    if (isLitElement(customElementDeclaration)) return ELEMENT_TYPES.LIT;
    if (isFastElement(element)) return ELEMENT_TYPES.FAST;
    if (isAtomicoElement(customElementDeclaration)) return ELEMENT_TYPES.ATOMICO;
    if (isPolymerElement(customElementDeclaration)) return ELEMENT_TYPES.POLYMER;
    if (isAngularElement(element)) return ELEMENT_TYPES.ANGULAR;

    return ELEMENT_TYPES.VANILLA;
}

/**
 * @param {any} customElementDeclaration
 */
export function isLitElement(customElementDeclaration) {
    // elementProperties is lit 2.0, and _classproperties is lit < 2.0
    return (
        typeof customElementDeclaration.elementProperties !== 'undefined' ||
        typeof customElementDeclaration._classProperties !== 'undefined'
    );
}

/**
 * @param {any} element
 */
export function isFastElement(element) {
    return typeof element.$fastController !== 'undefined';
}

/**
 * @param {any} customElementDeclaration
 */
export function isAtomicoElement(customElementDeclaration) {
    return customElementDeclaration.name === 'Atom';
}

/**
 * @param {any} customElementDeclaration
 */
export function isPolymerElement(customElementDeclaration) {
    return (
        typeof customElementDeclaration.__properties !== 'undefined' &&
        typeof customElementDeclaration.__finalized !== 'undefined'
    );
}

/**
 * @param {any} element
 */
export function isAngularElement(element) {
    return element.__ngContext__ !== undefined || element._ngElementStrategy !== undefined;
}

/**
 * @type ElementTypeMap
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
    ATOMICO: {
        id: 3,
        parser: parseAtomicoElement,
        onUpdate: updateAtomicoElementValue,
    },
    POLYMER: {
        id: 4,
        parser: parsePolymerElement,
        onUpdate: updatePolymerElementValue,
    },
    ANGULAR: {
        id: 5,
        parser: parseAngularElement,
        onUpdate: updateAngularElementValue,
    },
};
