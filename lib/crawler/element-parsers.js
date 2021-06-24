import { attributeIsBoolean } from './crawler-utils';

//TODO(Matsuuu): Check if there's duplicates in the attr/prop maps in a case there is a element AND a CEM

/**
 * For presumed vanilla elements, we take a look at the observedAttributes,
 * and go from there. Naively guessing the type of the element.
 *
 * In the Devtools UI, we will allow the user to change the type if it's wrong
 * and save it in some kind of database.
 *  @param {any} customElementDeclaration
 *  @param {HTMLElement} element
 *  @param {DevToolsElement} elementData
 */
export function parseGenericComponent(customElementDeclaration, element, elementData) {
    determineAttributes(customElementDeclaration, elementData, element);
    mapAttributeValues(elementData, element);
    mapPropertyValues(elementData, element);
}

/**
    * Determine the attributes names and types by ducktyping.
    *
    * If a attribute is already declared from custom-elements-manifest, we
    * won't overwrite those, but just continue.
    *
 * @param {any} customElementDeclaration
 * @param {DevToolsElement} elementData
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
 *  @param {DevToolsElement} elementData
 *  @param {HTMLElement} element
 * */
function mapPropertyValues(elementData, element) {
    const propertyValues = {};
    if (!elementData.properties) {
        elementData.propertyValues = propertyValues;
        return;
    }

    for (const prop of elementData.properties) {
        propertyValues[prop.name] = element[prop.name];
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
    return attributeIsBoolean(element, attribute) ? { text: 'boolean' } : { text: 'string' };
}

/**
 * @param {{ observedAttributes: any; }} customElementDeclaration
 * @param {HTMLElement} element
 */
function mapObservedAttributes(customElementDeclaration, element) {
    const attributes = [];
    const attributeValues = {};
    const observedAttributes = customElementDeclaration.observedAttributes;
    if (!observedAttributes) return { attributes, attributeValues };
    for (const name of observedAttributes) {
        let type = { text: 'string' };
        /** @type {any} */
        let value = element.getAttribute(name);

        if (value == null) {
            // If the attribute is null, we can check the actual property
            // value, and in case there is one set, we can ducktype from that
            const propValue = element[name];
            if (propValue != null) value = propValue;
        }

        if (attributeIsBoolean(value)) {
            type = { text: 'boolean' };
            value = value === '' || value === 'true';
        }

        attributes.push({
            name,
            type,
        });
        attributeValues[name] = value;
    }
    return { attributes, attributeValues };
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
    const classProperties = customElementDeclaration._classProperties;

    for (const [name, property] of classProperties) {
        properties.push({
            name,
            kind: 'field',
            type: { text: property.type?.name?.toLowerCase() ?? String.name.toLowerCase() },
        });

    }
    if (!elementData.properties) elementData.properties = [];
    elementData.properties = [...elementData.properties, ...properties];

    // Do the default action to map attributes
    parseGenericComponent(customElementDeclaration, element, elementData);
}

export const parserScriptsInject = `
${parseGenericComponent.toString()}
${parseLitElement.toString()}
${mapObservedAttributes.toString()}
${mapPropertyValues.toString()}
${mapAttributeValues.toString()}
${determineAttributes.toString()}
${determineAttributeType.toString()}
`;
