/**
 * For presumed vanilla elements, we take a look at the observedAttributes,
 * and go from there. Naively guessing the type of the element.
 *
 * In the Devtools UI, we will allow the user to change the type if it's wrong
 * and save it in some kind of database.
 *  @param {any} customElementDeclaration
 *  @param {HTMLElement} element
 *  @param {import('../types/devtools-element').DevToolsElement} elementData
 */
export function parseGenericComponent(customElementDeclaration, element, elementData) {
    determineAttributes(customElementDeclaration, elementData, element);
    mapAttributeValues(elementData, element);
    mapPropertyValues(customElementDeclaration, elementData, element);
}

/**
 * Determine the attributes names and types by ducktyping.
 *
 * If a attribute is already declared from custom-elements-manifest, we
 * won't overwrite those, but just continue.
 *
 * @param {any} customElementDeclaration
 * @param {import('../types/devtools-element').DevToolsElement} elementData
 * @param {HTMLElement} element
 */
function determineAttributes(customElementDeclaration, elementData, element) {
    const observedAttributes = customElementDeclaration.observedAttributes ?? [];

    if (!elementData.attributes) elementData.attributes = [];

    const existingAttributeKeys = elementData.attributes.map(at => at.name);
    for (const attrName of observedAttributes) {
        if (existingAttributeKeys.includes(attrName)) continue; // This attribute is already declared

        /** @type import('custom-elements-manifest/schema').Attribute */
        let attribute = { name: attrName };
        attribute.type = determineAttributeType(attribute, element);

        elementData.attributes.push(attribute);
    }
}

/**
 * Map the property values from the element to a map.
 * Expects the elementData.properties to have descriptions of properties.
 *
 * These can be either:
 * 1. Acquired from the custom-elements-manifest
 * 2. Be determined from the CustomElementsDeclaration
 *
 *  @param {any} customElementDeclaration
 *  @param {import('../types/devtools-element').DevToolsElement} elementData
 *  @param {HTMLElement} element
 * */
function mapPropertyValues(customElementDeclaration, elementData, element) {
    const propertyValues = {};
    if (!elementData.properties) {
        elementData.propertyValues = propertyValues;
        return;
    }

    for (const prop of elementData.properties) {
        if (!prop.name) continue;
        try {
            if (prop.static) {
                propertyValues[prop.name] = customElementDeclaration[prop.name];
            } else {
                propertyValues[prop.name] = element[prop.name];
            }
        } catch (_) {
            // ignored
        }
    }
    elementData.propertyValues = propertyValues;
}
/**
 * Map the attribute values from the element to a map.
 * Expects the elementData.properties to have descriptions of properties.
 *
 * These can be either:
 * 1. Acquired from the custom-elements-manifest
 * 2. Be determined from the CustomElementsDeclaration
 *
 *  @param {DevToolsElement} elementData
 *  @param {HTMLElement} element
 * */
function mapAttributeValues(elementData, element) {
    const attributeValues = {};
    if (!elementData.attributes) {
        elementData.attributeValues = attributeValues;
        return;
    }
    for (const attr of elementData.attributes) {
        let attrType = determineAttributeType(attr, element);
        switch (attrType.text) {
            case 'boolean':
                attributeValues[attr.name] = element.hasAttribute(attr.name);
                break;
            case 'string':
            default:
                attributeValues[attr.name] = element.getAttribute(attr.name);
                break;
        }
    }
    elementData.attributeValues = attributeValues;
}

/**
 * @param {import("custom-elements-manifest/schema").Attribute} attribute
 * @param {HTMLElement} element
 */
function determineAttributeType(attribute, element) {
    if (attribute.type) return attribute.type;
    return { text: 'undefined' };
}

/**
 * Lit declares the properties in a _classProperties -field in the custom element class declaration.
 * We can map the properties here before we pass them to the default behavior to scrape the data
 *
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementData
 */
export function parseLitElement(customElementDeclaration, element, elementData) {
    /** @type Array<import('custom-elements-manifest/schema').ClassField> */
    const properties = [];
    let classProperties = customElementDeclaration._classProperties;
    if (!classProperties) {
        classProperties = customElementDeclaration.elementProperties;
    }

    for (const [name, property] of classProperties) {
        properties.push({
            name,
            kind: 'field',
            type: { text: property.type?.name?.toLowerCase() ?? element[name] ? typeof element[name] : 'string' },
        });
    }

    mergeProperties(elementData, properties);
    // Do the default action to map attributes
    parseGenericComponent(customElementDeclaration, element, elementData);
}

/**
 * FAST element nicely provides it's info in a $fastController -property
 * attached to the element itself.
 *
 * We also grab the subscribers onto the property list for a better DX.
 *
 *
 * @param {any} customElementDeclaration
 * @param {any} element
 * @param {DevToolsElement} elementData
 */
export function parseFastElement(customElementDeclaration, element, elementData) {
    const controller = element.$fastController;

    const properties = [];
    const propKeyMap = {};
    Object.keys(controller.definition.propertyLookup).map(propKey => {
        propKeyMap[propKey] = true;
        properties.push({
            name: propKey,
            kind: 'field',
            type: element[propKey] ? typeof element[propKey] : 'string',
        });
    });
    Object.keys(controller.subscribers).map(subKey => {
        if (!propKeyMap[subKey]) {
            properties.push({
                name: subKey,
                kind: 'field',
                type: element[subKey] ? typeof element[subKey] : 'string',
            });
        }
    });

    mergeProperties(elementData, properties);
    parseGenericComponent(customElementDeclaration, element, elementData);
}

/**
 * Atomico elements expose a _props -field which we can easily parse
 * to get the props. Then we ducktype through them
 *
 * @param {any} customElementDeclaration
 * @param {any} element
 * @param {DevToolsElement} elementData
 */
export function parseAtomicoElement(customElementDeclaration, element, elementData) {
    const properties = [];
    Object.keys(element._props).map(propKey => {
        properties.push({
            name: propKey,
            kind: 'field',
            type: element[propKey] ? typeof element[propKey] : 'string',
        });
    });

    mergeProperties(elementData, properties);
    parseGenericComponent(customElementDeclaration, element, elementData);
}

/**
 * Polymer Elements work similiar to LitElement due to them being the
 * early version of Lit.
 *
 * We parse through the __properties and that's it
 *
 * @param {any} customElementDeclaration
 * @param {any} element
 * @param {DevToolsElement} elementData
 */
export function parsePolymerElement(customElementDeclaration, element, elementData) {
    /** @type Array<import('custom-elements-manifest/schema').ClassField> */
    const properties = [];
    let classProperties = customElementDeclaration.__properties;

    for (const [name, property] of Object.entries(classProperties)) {
        properties.push({
            name,
            kind: 'field',
            type: { text: property.type?.name?.toLowerCase() ?? element[name] ? typeof element[name] : 'string' },
        });
    }

    mergeProperties(elementData, properties);
    parseGenericComponent(customElementDeclaration, element, elementData);
}

export function parseAngularElement(customElementDeclaration, element, elementData) {
    /** @type Array<import('custom-elements-manifest/schema').ClassField> */
    elementData.properties = elementData.properties.filter(prop => prop.name !== "ngElementStrategy");

    parseGenericComponent(customElementDeclaration, element, elementData);
}

/**
 * @param {DevToolsElement} elementData
 * @param {any[]} properties
 */
function mergeProperties(elementData, properties) {
    if (!elementData.properties) elementData.properties = [];
    elementData.properties = [...elementData.properties, ...properties];
}
