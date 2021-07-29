import {
    getCustomElementDeclarations,
    getCustomElementModules,
    getElementMethods,
    getElementProperties,
    getParentManifest,
    getTagName,
} from './custom-elements-helpers';
import { fetchExternalLibraryManifests, fetchManifest } from './manifest-fetchers';

/**
 * @param {import('custom-elements-manifest/schema').Package} manifest
 *
 * @returns {ManifestData}
 */
export function parseElementDeclarationMap(manifest) {
    /** @type Object.<String, DevToolsElement> */
    const declarationMap = {};
    const modules = getCustomElementModules(manifest);

    for (const manifestModule of modules) {
        const customElementDeclarations = getCustomElementDeclarations(manifestModule);
        for (const elementDeclaration of customElementDeclarations) {
            const tagName = getTagName(elementDeclaration, manifestModule);
            declarationMap[tagName] = declarationToManifestDataEntry(tagName, elementDeclaration);
        }
    }

    return declarationMap;
}

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
        parentClass: elementDeclaration.superclass,
        attributes: elementDeclaration.attributes ?? [],
        properties: getElementProperties(elementDeclaration) ?? [],
        events: elementDeclaration.events ?? [],
        methods: getElementMethods(elementDeclaration),
    };
}

/**
 * Fetch the manifest data of current project, and if in dev mode,
 * also the dependency projects.
 *
 *  Parse through the manifest and map them into a more usable format for us.
 *  @returns {Promise<ManifestData>} MANIFEST_REQUEST
 *  @param {string} [baseUrl] 
 *  @param {any} [customElementsPath]
 **/
export async function mapCustomElementManifestData(baseUrl, customElementsPath) {
    // Prevent duplicate requests due to race conditions
    const manifestRequest = new Promise(async resolve => {
        const manifest = await fetchManifest(baseUrl, customElementsPath);
        if (!manifest || !manifest.modules) return resolve({});

        const externalManifest = await fetchExternalLibraryManifests(baseUrl);
        externalManifest.forEach(exMan => (manifest.modules = [...manifest.modules, ...exMan.modules]));

        const parsed = parseElementDeclarationMap(manifest);
        resolve(parsed);
    });
    return manifestRequest;
}

/**
 * Get the corresponding element's data from the CEM data.
 *
 * If the element has a superclass, we also fetch the data of the superclass.
 * and add necessary data fields where needed
 *
 * @param { ManifestData } manifestData
 * @param { String } tagName
 * */
export function getElementDataFromCustomElementManifest(manifestData, tagName) {
    let elementData = manifestData[tagName];
    inheritData(manifestData, elementData);
    cleanUpData(elementData);
    return elementData;
}

/**
 * As you can extend custom elements from other classes/elements,
 * it's required for us to find the properties, attributes etc.
 * of those parent classes too, and merge them onto this class to
 * provide them in the devtools window.
 * @param { ManifestData } manifestData
 * @param { DevToolsElement } elementData
 */
export function inheritData(manifestData, elementData) {
    if (!elementData.parentClass?.name) return;
    let parentClassManifestData = getParentManifest(manifestData, elementData);

    while (parentClassManifestData) {
        mergeManifestDatas(elementData, parentClassManifestData);
        cleanUpData(elementData);
        parentClassManifestData = getParentManifest(manifestData, parentClassManifestData);
    }
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
