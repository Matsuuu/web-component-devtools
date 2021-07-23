/**
 * @param {import("custom-elements-manifest/schema").Package} manifest
 * @returns {Array<import('custom-elements-manifest/schema').Module>}
 */
export function getCustomElementModules(manifest) {
    return manifest.modules.filter(
        manifestModule => hasCustomElementDefinition(manifestModule) || isCustomElementModule(manifestModule),
    );
}

/**
 * @param {import("custom-elements-manifest/schema").Module} manifestModule
 * @returns {Array<import('custom-elements-manifest/schema').CustomElement>}
 */
export function getCustomElementDeclarations(manifestModule) {
    return /** @type Array<import('custom-elements-manifest/schema').CustomElement> */ (
        manifestModule.declarations.filter(dec => isClassDeclaration(dec) && isCustomElementDeclaration(dec))
    );
}

/**
 * @param {import('custom-elements-manifest/schema').CustomElement} customElement
 *
 * @returns { Array<import('custom-elements-manifest/schema').ClassMethod> } methods
 */
export function getElementMethods(customElement) {
    return /** @type { Array<import('custom-elements-manifest/schema').ClassMethod> } */ (customElement.members?.filter(
        isMethodMember,
    ));
}

/**
 * @param {import("custom-elements-manifest/schema").CustomElement} customElement
 *
 * @returns { Array<import('custom-elements-manifest/schema').ClassField> } properties
 */
export function getElementProperties(customElement) {
    return /** @type Array<import('custom-elements-manifest/schema').ClassField> */ (
        customElement.members?.filter(isFieldMember)
    );
}

/**
 * @param {import('custom-elements-manifest/schema').ClassMember} classMember
 */
export function isMethodMember(classMember) {
    return classMember.kind === 'method';
}

/**
 * @param {import('custom-elements-manifest/schema').ClassMember} classMember
 */
export function isFieldMember(classMember) {
    return classMember.kind === 'field';
}

/**
 * @param {import('custom-elements-manifest/schema').Declaration} customElement
 */
export function isCustomElementDeclaration(customElement) {
    return /** @type import('custom-elements-manifest/schema').CustomElement */ (customElement).customElement;
}

/**
 * @param {import('custom-elements-manifest/schema').Declaration} declaration
 */
export function isClassDeclaration(declaration) {
    return declaration.kind === 'class';
}

/**
 * @param {import('custom-elements-manifest/schema').Module} manifestMod
 */
export function isCustomElementModule(manifestMod) {
    return manifestMod.declarations.some(dec => isCustomElementDeclaration(dec));
}

/**
 * @param {import('custom-elements-manifest/schema').Module} manifestMod
 */
export function hasCustomElementDefinition(manifestMod) {
    return manifestMod.exports.some(exp => isCustomElementExport(exp));
}

/**
 * @param {import('custom-elements-manifest/schema').Export} exp
 */
export function isCustomElementExport(exp) {
    return exp.kind === 'custom-element-definition';
}

/**
 * @param {ManifestData} manifestData
 * @param {DevToolsElement} elementData
 * */
export function getParentManifest(manifestData, elementData) {
    return Object.values(manifestData).find(dec => dec.name === elementData.parentClass?.name);
}

export function isDevMode() {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
}

/**
 * Fetches the tagname of given CustomElement.
 *
 * If no tagname is provided on the element, we attempt to fetch it from the exports
 *
 * @param {import('custom-elements-manifest/schema').CustomElement} moduleDeclaration
 * @param {import("custom-elements-manifest/schema").Module} manifestModule
 */
export function getTagName(moduleDeclaration, manifestModule) {
    let tagName = moduleDeclaration.tagName;
    if (!tagName) {
        tagName = manifestModule.exports.find(exp => isCustomElementExport(exp))?.name;
    }
    return tagName;
}

/**
 * @param {string} [baseUrl]
 */
export function getPackageJsonUrl(baseUrl) {
    return getBaseUrl(baseUrl) + '/package.json';
}

/**
 * @param {string} [existingBase]
 */
export function getBaseUrl(existingBase) {
    if (existingBase) return existingBase;

    const baseTag = document.querySelector('base');
    let baseUrl = baseTag ? baseTag.href : window.location.origin;
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }
    return baseUrl;
}

/**
 * @param {string} [baseUrl]
 * @param {string} [customElementsPath]
 */
export function getCustomElementsManifestUrl(baseUrl, customElementsPath) {
    if (customElementsPath) return buildCustomElementsManifestPath(customElementsPath, baseUrl);

    return buildCustomElementsManifestPath('custom-elements.json', baseUrl);
}

/**
 * @param {string} path
 * @param {string} baseUrl
 */
function buildCustomElementsManifestPath(path, baseUrl) {
    if (path.includes('://')) return path; // e.g. https://my-site.com/custom-elements.json
    if (path.startsWith('/')) return getBaseUrl(baseUrl) + path; // e.g. /dist/custom-elements.json
    return getBaseUrl(baseUrl) + '/' + path; // e.g. custom-elements.json
}
