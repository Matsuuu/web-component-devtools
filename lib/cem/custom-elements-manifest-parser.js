/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    try {
        const origin = window.location.origin;
        const manifest = await fetch(origin + '/custom-elements.json')
            .then(res => {
                if (res.status >= 200 && res.status < 300) {
                    return Promise.resolve(res);
                } else {
                    return Promise.reject(res.status.toString());
                }
            })
            .catch(err => console.warn('[WebComponentDevTools]: Could not find custom-elements.json:', err));
        return manifest ? await manifest.json() : null;
    } catch (err) {
        return null;
    }
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

    console.log("Decmap: ", declarationMap);

    return declarationMap;
}

/**
 * @param {import("custom-elements-manifest/schema").Package} manifest
 * @returns {Array<import('custom-elements-manifest/schema').Module>}
 */
function getCustomElementModules(manifest) {
    return manifest.modules.filter(
        manifestModule => hasCustomElementDefinition(manifestModule) && isCustomElementModule(manifestModule),
    );
}

/**
 * @param {import("custom-elements-manifest/schema").Module} manifestModule
 * @returns {Array<import('custom-elements-manifest/schema').CustomElement>}
 */
function getCustomElementDeclarations(manifestModule) {
    return /** @type Array<import('custom-elements-manifest/schema').CustomElement> */ (manifestModule.declarations.filter(
        dec => isClassDeclaration(dec) && isCustomElementDeclaration(dec),
    ));
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
    return /** @type Array<import('custom-elements-manifest/schema').ClassField> */ (customElement.members?.filter(
        isFieldMember,
    ));
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
    const manifest = await fetchManifest();
    if (!manifest || !manifest.modules) return {};

    const parsed = parseElementDeclarationMap(manifest);
    return parsed;
}
