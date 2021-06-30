const DEP_IGNORE_CACHE = [];
const CEM_CACHE = {};
let PACKAGE_JSON = null;
let MANIFEST_REQUEST = null;

/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    const origin = window.location.origin;
    const packageUrl = origin + '/package.json';

    if (CEM_CACHE[packageUrl]) return CEM_CACHE[packageUrl];

    let manifestUrl;
    if (isDevMode()) {
        PACKAGE_JSON = await fetch(packageUrl)
            .then(res => res.json())
            .catch(err => {
                return null;
            });
        if (!PACKAGE_JSON) return null;
        manifestUrl = origin + '/' + PACKAGE_JSON.customElements;
    } else {
        manifestUrl = origin + '/custom-elements.json';
    }

    const manifest = await fetch(manifestUrl)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return Promise.resolve(res);
            } else {
                return Promise.reject(res.status.toString());
            }
        })
        .then(res => {
            if (res) return res.json();
            return res;
        })
        .catch(err => console.warn('[WebComponentDevTools]: Could not find custom-elements.json'));
    if (manifest) {
        CEM_CACHE[packageUrl] = manifest;
    }
    return manifest;
}

function isDevMode() {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
}

/**
 * When in a local dev environment, we want to be able to get the dependency CEM's too
 * */
export async function fetchExternalLibraryManifests() {
    const manifests = [];
    const origin = window.location.origin;
    const isDevEnv = isDevMode();
    if (!isDevEnv) return manifests;

    if (!PACKAGE_JSON) return manifests;

    const dependencies = PACKAGE_JSON.dependencies;
    for (const dep of Object.keys(dependencies)) {
        if (DEP_IGNORE_CACHE.includes(dep)) continue; // We've scanned that there is not CEM so ignore it

        const depPackageJson = await fetch(origin + '/node_modules/' + dep + '/package.json').then(res => res.json());
        const customElementsPath = depPackageJson.customElements;
        if (customElementsPath) {
            const externalLibManifestPath = origin + '/node_modules/' + dep + '/' + customElementsPath;
            const externalLibManifest = await fetch(externalLibManifestPath).then(res => res.json());
            manifests.push(externalLibManifest);
        } else {
            DEP_IGNORE_CACHE.push(dep);
        }
    }

    return manifests;
}

/**
 * @param {import('custom-elements-manifest/schema').Package} manifest
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
 * @param {import("custom-elements-manifest/schema").Package} manifest
 * @returns {Array<import('custom-elements-manifest/schema').Module>}
 */
function getCustomElementModules(manifest) {
    return manifest.modules.filter(
        manifestModule => hasCustomElementDefinition(manifestModule) || isCustomElementModule(manifestModule),
    );
}

/**
 * @param {import("custom-elements-manifest/schema").Module} manifestModule
 * @returns {Array<import('custom-elements-manifest/schema').CustomElement>}
 */
function getCustomElementDeclarations(manifestModule) {
    return /** @type Array<import('custom-elements-manifest/schema').CustomElement> */ (
        manifestModule.declarations.filter(dec => isClassDeclaration(dec) && isCustomElementDeclaration(dec))
    );
}

/**
 * @param {import('custom-elements-manifest/schema').CustomElement} customElement
 *
 * @returns { Array<import('custom-elements-manifest/schema').ClassMember> } methods
 */
function getElementMethods(customElement) {
    return customElement.members?.filter(isMethodMember);
}

/**
 * @param {import("custom-elements-manifest/schema").CustomElement} customElement
 *
 * @returns { Array<import('custom-elements-manifest/schema').ClassField> } properties
 */
function getElementProperties(customElement) {
    return /** @type Array<import('custom-elements-manifest/schema').ClassField> */ (
        customElement.members?.filter(isFieldMember)
    );
}

/**
 * @param {import('custom-elements-manifest/schema').ClassMember} classMember
 */
function isMethodMember(classMember) {
    return classMember.kind === 'method';
}

/**
 * @param {import('custom-elements-manifest/schema').ClassMember} classMember
 */
function isFieldMember(classMember) {
    return classMember.kind === 'field';
}

/**
 * @param {import('custom-elements-manifest/schema').Declaration} customElement
 */
function isCustomElementDeclaration(customElement) {
    return /** @type import('custom-elements-manifest/schema').CustomElement */ (customElement).customElement;
}

/**
 * @param {import('custom-elements-manifest/schema').Declaration} declaration
 */
function isClassDeclaration(declaration) {
    return declaration.kind === 'class';
}

/**
 * @param {import('custom-elements-manifest/schema').Module} manifestMod
 */
function isCustomElementModule(manifestMod) {
    return manifestMod.declarations.some(dec => isCustomElementDeclaration(dec));
}

/**
 * @param {import('custom-elements-manifest/schema').Module} manifestMod
 */
function hasCustomElementDefinition(manifestMod) {
    return manifestMod.exports.some(exp => isCustomElementExport(exp));
}

/**
 * @param {import('custom-elements-manifest/schema').Export} exp
 */
function isCustomElementExport(exp) {
    return exp.kind === 'custom-element-definition';
}

/**
 * @param {import('custom-elements-manifest/schema').CustomElement} moduleDeclaration
 * @param {import("custom-elements-manifest/schema").Module} manifestModule
 */
function getTagName(moduleDeclaration, manifestModule) {
    let tagName = moduleDeclaration.tagName;
    if (!tagName) {
        tagName = manifestModule.exports.find(exp => isCustomElementExport(exp))?.name;
    }
    return tagName;
}

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
 * */
export function getElementDataFromCustomElementManifest(manifestData, tagName) {
    let elementData = manifestData[tagName];
    inheritData(manifestData, elementData);
    return elementData;
}

function inheritData(manifestData, elementData) {
    if (!elementData.parentClass?.name) return;
    let parentClassManifestData = getParentManifest(manifestData, elementData);

    while (parentClassManifestData) {
        mergeManifestDatas(elementData, parentClassManifestData);
        cleanUpData(elementData);
        parentClassManifestData = getParentManifest(manifestData, parentClassManifestData);
    }
}

function cleanUpData(elementData) {
    cleanDuplicates(elementData, 'properties');
    cleanDuplicates(elementData, 'attributes');
    cleanDuplicates(elementData, 'events');
    cleanDuplicates(elementData, 'methods');
}

function cleanDuplicates(elementData, field) {
    const seen = {};
    elementData[field] = elementData[field].filter(prop => {
        if (seen[prop.name]) return false;
        seen[prop.name] = prop;
        return true;
    });
}

function getParentManifest(manifestData, elementData) {
    return Object.values(manifestData).find(dec => dec.name === elementData.parentClass?.name);
}

/**
 * @param {any} targetData
 * @param {any} newData
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
 * @param {any} prop
 * @param {any} inheritance
 */
function addInheritanceIfMissing(prop, inheritance) {
    if (prop.inheritedFrom) return prop;

    const newProp = { ...prop };
    newProp.inheritedFrom = inheritance;

    return newProp;
}
