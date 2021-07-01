import {
    getCustomElementDeclarations,
    getCustomElementModules,
    getElementMethods,
    getElementProperties,
    getParentManifest,
    getTagName,
} from './custom-elements-helpers';
import { fetchExternalLibraryManifests, fetchManifest } from './manifest-fetchers';

let MANIFEST_REQUEST = null;

/**
 * @param {import('custom-elements-manifest/schema').Package} manifest
 *
 * @returns {ManifestData}
 */
function parseElementDeclarationMap(manifest) {
    /** @type Object.<String, DevToolsElement> */
    const declarationMap = {};
    const modules = getCustomElementModules(manifest);

    for (const manifestModule of modules) {
        const customElementDeclarations = getCustomElementDeclarations(manifestModule);
        for (const elementDeclaration of customElementDeclarations) {
            const tagName = getTagName(elementDeclaration, manifestModule);

            declarationMap[tagName] = {
                name: elementDeclaration.name,
                tagName,
                parentClass: elementDeclaration.superclass,
                attributes: elementDeclaration.attributes ?? [],
                properties: getElementProperties(elementDeclaration) ?? [],
                events: elementDeclaration.events ?? [],
                methods: getElementMethods(elementDeclaration),
            };
        }
    }

    return declarationMap;
}

/**
 * Fetch the manifest data of current project, and if in dev mode,
 * also the dependency projects.
 *
 * Parse through the manifest and map them into a more usable format for us.
 *
 * @returns {Promise<ManifestData>} MANIFEST_REQUEST
 * */
export async function mapCustomElementManifestData() {
    if (!MANIFEST_REQUEST) {
        // Prevent duplicate requests due to race conditions
        MANIFEST_REQUEST = new Promise(async resolve => {
            const manifest = await fetchManifest();
            if (!manifest || !manifest.modules) return resolve({});

            const externalManifest = await fetchExternalLibraryManifests();
            externalManifest.forEach(exMan => (manifest.modules = [...manifest.modules, ...exMan.modules]));

            const parsed = parseElementDeclarationMap(manifest);
            resolve(parsed);
        });
    }
    return MANIFEST_REQUEST;
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
function inheritData(manifestData, elementData) {
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
function cleanUpData(elementData) {
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
    const seen = {};
    elementData[field] = elementData[field].filter(
        (/** @type { import('custom-elements-manifest/schema').ClassMember } */ prop) => {
            if (seen[prop.name]) return false;
            seen[prop.name] = prop;
            return true;
        },
    );
}

/**
 * Merge the collections of attributes, properties, events etc.
 * of the newData to the targetData
 *
 * @param {DevToolsElement} targetData
 * @param {DevToolsElement} newData
 */
export function mergeManifestDatas(targetData, newData) {
    targetData.attributes = [
        ...(targetData.attributes ?? []),
        ...(newData.attributes?.map((/** @type {any} */ attr) =>
            addInheritanceIfMissing(attr, targetData.parentClass),
        ) ?? []),
    ];
    targetData.properties = [
        ...(targetData.properties ?? []),
        ...(newData.properties?.map((/** @type {any} */ prop) =>
            addInheritanceIfMissing(prop, targetData.parentClass),
        ) ?? []),
    ];
    targetData.events = [
        ...(targetData.events ?? []),
        ...(newData.events?.map((/** @type {any} */ ev) => addInheritanceIfMissing(ev, targetData.parentClass)) ?? []),
    ];
    targetData.methods = [
        ...(targetData.methods ?? []),
        ...(newData.methods?.map((/** @type {any} */ meth) => addInheritanceIfMissing(meth, targetData.parentClass)) ??
            []),
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
    if (prop.inheritedFrom) return prop;

    const newProp = { ...prop };
    newProp.inheritedFrom = inheritance;

    return newProp;
}
