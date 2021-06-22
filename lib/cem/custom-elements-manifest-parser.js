/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    const origin = window.location.origin;
    const manifest = await fetch(origin + '/custom-elements.json');

    try {
        return await manifest.json();
    } catch (err) {
        return null;
    }
}

/**
 * @param {import('custom-elements-manifest/schema').Package} manifest
 */
function parseElementDeclarationMap(manifest) {
    console.log(manifest);
    /** @type Object.<String, DevToolsElement> */
    const declarationMap = {};
    const elementDeclarations = getCustomElementDeclarations(manifest);

    for (const elementDeclaration of elementDeclarations) {
        declarationMap[elementDeclaration.tagName] = {
            name: elementDeclaration.name,
            tagName: getTagName(elementDeclaration),
            parentClass: elementDeclaration.superclass,
            attributes: elementDeclaration.attributes ?? [],
            properties: getElementProperties(elementDeclaration) ?? [],
            events: elementDeclaration.events ?? [],
            methods: getElementMethods(elementDeclaration),
        };
    }
    return declarationMap;
}

/**
 * @returns {Array<import('custom-elements-manifest/schema').CustomElement>}
 * @param {import("custom-elements-manifest/schema").Package} manifest
 */
function getCustomElementDeclarations(manifest) {
    return manifest.modules.reduce(
        (coll, manifestModule) => [
            ...coll,
            ...manifestModule.declarations.filter(dec => isClassDeclaration(dec) && isCustomElementDeclaration(dec)),
        ],
        [],
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
 * @param {import('custom-elements-manifest/schema').CustomElement} moduleDeclaration
 */
function getTagName(moduleDeclaration) {
    return moduleDeclaration.tagName;
}

export async function mapCustomElementManifestData() {
    const manifest = await fetchManifest();
    if (!manifest) return;

    const parsed = parseElementDeclarationMap(manifest);
    console.log('Parsed', parsed);
    return parsed;
}
