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
 * @returns { Array<import('custom-elements-manifest/schema').ClassMember> } methods
 */
export function getElementMethods(customElement) {
    return customElement.members?.filter(isMethodMember);
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

export function getPackageJsonUrl() {
    const origin = window.location.origin;
    return origin + '/package.json';
}

export function getCustomElementsManifestUrl() {
    const origin = window.location.origin;

    const metaTag = /** @type {HTMLMetaElement} */ (document.querySelector("meta[name='custom-elements']"));
    if (metaTag) return origin + "/" + metaTag.content;

    return origin + '/custom-elements.json';
}
