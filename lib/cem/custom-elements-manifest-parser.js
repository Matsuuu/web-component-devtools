/**
 * @typedef DevToolsElement
 * @property {String} name
 * @property {String} [tagName]
 * @property {import('custom-elements-manifest/schema').ClassDeclaration} [parentClass]
 * @property {Array<import('custom-elements-manifest/schema').Attribute>} attributes
 * @property {Array<import('custom-elements-manifest/schema').ClassField>} properties
 * @property {Array<import('custom-elements-manifest/schema').Event>} events
 * @property {Array<import('custom-elements-manifest/schema').ClassMethod>} methods
 * */

/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    const origin = window.location.origin;
    const manifest = await fetch(origin + '/custom-elements.json');

    if (!manifest) return null;
    return await manifest.json();
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
 * @param {{ modules: any[]; }} manifest
 *
 * @returns {Array<import('custom-elements-manifest/schema').CustomElement>}
 */
function getCustomElementDeclarations(manifest) {
    return manifest.modules.reduce(
        (
            /** @type Array<import('custom-elements-manifest/schema').Module> */ coll,
            /** @type import('custom-elements-manifest/schema').Module */ manifestModule,
        ) => [
                ...coll,
                ...manifestModule.declarations.filter(
                    dec =>
                        isClassDeclaration(dec) &&
                        isCustomElementDeclaration(
                        /** @type import('custom-elements-manifest/schema').CustomElement */(dec),
                        ),
                ),
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
 * @param {import('custom-elements-manifest/schema').CustomElement} customElement
 */
function isCustomElementDeclaration(customElement) {
    return customElement.customElement;
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

/**
 * @param {Map<String, Object>} customElementsMap
 */
export async function mapCustomElementManifestData(customElementsMap) {
    console.log('CustomElementsMap', customElementsMap);
    const manifest = await fetchManifest();
    if (!manifest) return;

    const parsed = parseElementDeclarationMap(manifest);
    console.log('Parsed', parsed);
    return parsed;
}
