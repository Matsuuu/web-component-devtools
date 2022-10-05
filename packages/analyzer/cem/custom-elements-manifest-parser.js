import {
    getElementMethods,
    getElementProperties,
} from './custom-elements-helpers';

/**
 * @param {string} tagName
 * @param {import("custom-elements-manifest/schema").CustomElement} elementDeclaration
 *
 * @returns {DevToolsElement}
 */
export function declarationToManifestDataEntry(tagName, elementDeclaration) {
    return {
        name: elementDeclaration?.name,
        tagName,
        parentClass: elementDeclaration?.superclass,
        attributes: elementDeclaration?.attributes ?? [],
        properties: getElementProperties(elementDeclaration) ?? [],
        events: elementDeclaration?.events ?? [],
        methods: getElementMethods(elementDeclaration),
    };
}

/**
 * Merge the collections of attributes, properties, events etc.
 * of the newData to the targetData
 *
 * @param {DevToolsElement} targetData
 * @param {DevToolsElement} newData
 * @param {import('custom-elements-manifest/schema').Reference} [inheritance]
 */
export function mergeManifestDatas(targetData, newData, inheritance) {
    targetData.attributes = [
        ...(targetData.attributes ?? []),
        ...(newData.attributes?.map((/** @type {any} */ attr) =>
            addInheritanceIfMissing(attr, inheritance),
        ) ?? []),
    ];
    targetData.properties = [
        ...(targetData.properties ?? []),
        ...(newData.properties?.map((/** @type {any} */ prop) =>
            addInheritanceIfMissing(prop, inheritance),
        ) ?? []),
    ];
    targetData.events = [
        ...(targetData.events ?? []),
        ...(newData.events?.map((/** @type {any} */ ev) =>
            addInheritanceIfMissing(ev, inheritance),
        ) ?? []),
    ];
    targetData.methods = [
        ...(targetData.methods ?? []),
        ...(newData.methods?.map((/** @type {any} */ meth) =>
            addInheritanceIfMissing(meth, inheritance),
        ) ?? []),
    ];
}

/**
 * @template {{ inheritedFrom: import('custom-elements-manifest/schema').Reference }} T
 *
 * @param {T} prop
 * @param {import('custom-elements-manifest/schema').Reference} inheritance
 *
 * @returns {T} newProp
 */
function addInheritanceIfMissing(prop, inheritance) {
    if (!inheritance) return prop;

    const newProp = { ...prop };
    newProp.inheritedFrom = inheritance;

    return newProp;
}
