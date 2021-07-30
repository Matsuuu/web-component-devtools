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
 * The data inheritance process isn't completely clean, and
 * therefore we need to do some small housekeeping to the elements
 *
 * @param { DevToolsElement } elementData
 * */
export function cleanUpData(elementData) {
    cleanDuplicates(elementData, 'properties');
    cleanDuplicates(elementData, 'attributes');
    cleanDuplicates(elementData, 'events');
    cleanDuplicates(elementData, 'methods');
}

/**
 * @param { DevToolsElement } elementData
 * @param { string } field
 */
function cleanDuplicates(elementData, field) {
    if (!elementData || !elementData[field]) return;
    const seen = {};
    // For firefox instances we need to access it via this API
    if (elementData.wrappedJSObject) {
        elementData.wrappedJSObject[field] = elementData[field].filter(
            (/** @type { import('custom-elements-manifest/schema').ClassMember } */ prop) => {
                const propName = prop?.name?.replace('__', '');
                if (!propName || seen[propName]) return false;
                seen[propName] = prop;
                return true;
            },
        );
    } else {
        elementData[field] = elementData[field].filter(
            (/** @type { import('custom-elements-manifest/schema').ClassMember } */ prop) => {
                const propName = prop?.name?.replace('__', '');
                if (!propName || seen[propName]) return false;
                seen[propName] = prop;
                return true;
            },
        );
    }
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
