import { attributeIsBoolean } from "./crawler-utils";

/**
 * For presumed vanilla elements, we take a look at the observedAttributes,
 * and go from there. Naively guessing the type of the element.
 *
 * In the Devtools UI, we will allow the user to change the type if it's wrong
 * and save it in some kind of database.
 *
 * @param {{ observedAttributes: any; }} customElementDeclaration
 * @param {HTMLElement} element
 */
export function parseGenericComponent(customElementDeclaration, element) {
    const properties = {};
    const observedAttributes = customElementDeclaration.observedAttributes;

    if (!observedAttributes) return properties;

    for (const key of observedAttributes) {
        let type = String.name;
        /** @type {any} */
        let value = element.getAttribute(key);

        if (value == null) {
            // If the attribute is null, we can check the actual property
            // value, and in case there is one set, we can ducktype from that
            const propValue = element[key];
            if (propValue != null) value = propValue;
        }

        if (attributeIsBoolean(value)) {
            type = Boolean.name;
            value = value === "" || value === "true";
        }

        properties[key] = {
            key,
            type,
            value,
        };
    }

    return properties;
}

/**
 * Lit declares the properties in a _classProperties -field in the custom element class declaration.
 * We can scrape the data from there for Lit-like elements
 *
 * @param {{ _classProperties: any; }} customElementDeclaration
 * @param {HTMLElement} element
 */
export function parseLitElement(customElementDeclaration, element) {
    const properties = {};
    const classProperties = customElementDeclaration._classProperties;

    for (const [key, property] of classProperties) {
        properties[key] = {
            key,
            type: property.type?.name ?? String.name,
            reflect: !!property.reflect,
            attribute: !!property.attribute,
            value: element[key],
        };
    }

    return properties;
}

export const parserScriptsInject = `
${parseGenericComponent.toString()}
${parseLitElement.toString()}
`;
