import { attributeIsBoolean } from './crawler-utils';

/**
 * For presumed vanilla elements, we take a look at the observedAttributes,
 * and go from there. Naively guessing the type of the element.
 *
 * In the Devtools UI, we will allow the user to change the type if it's wrong
 * and save it in some kind of database.
 *
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementState
 */
export function parseGenericComponent(customElementDeclaration, element, elementState) {
    const attributeData = mapObservedAttributes(customElementDeclaration, element);
    elementState.attributes = attributeData.attributes;
    elementState.attributeValues = attributeData.attributeValues;
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
 * We can scrape the data from there for Lit-like elements
 *
 * @param {any} customElementDeclaration
 * @param {HTMLElement} element
 * @param {DevToolsElement} elementState
 */
export function parseLitElement(customElementDeclaration, element, elementState) {
    // Do the default action to map attributes
    parseGenericComponent(customElementDeclaration, element, elementState);

    // Then map the properties with help from lit
    /** @type Array<import('custom-elements-manifest/schema').ClassField> */
    const properties = [];
    const propertyValues = {};
    const classProperties = customElementDeclaration._classProperties;

    for (const [name, property] of classProperties) {
        properties.push({
            name,
            kind: 'field',
            type: { text: property.type?.name?.toLowerCase() ?? String.name.toLowerCase() },
        });

        propertyValues[name] = element[name];
    }

    elementState.properties = properties;
    elementState.propertyValues = propertyValues;
}

export const parserScriptsInject = `
${parseGenericComponent.toString()}
${parseLitElement.toString()}
${mapObservedAttributes.toString()}
`;
