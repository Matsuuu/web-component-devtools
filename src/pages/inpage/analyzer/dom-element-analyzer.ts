import {
    DomAnalyzedElement,
    PropertyType,
    PropertyTypes,
    StaticAnalyzedElement,
} from "../../../lib/analyzer/analyzed-element";
import { TreeElement } from "../../../pages/content/lib/element";

export function analyzeStaticAnalyzedElementAgainstDOM(
    staticAnalyzedElement: StaticAnalyzedElement,
    treeElement: TreeElement,
): DomAnalyzedElement {
    const domAnalyzedElement: DomAnalyzedElement = { ...staticAnalyzedElement };

    for (const [key, prop] of Object.entries(domAnalyzedElement.properties)) {
        prop.value = treeElement.element[key as keyof Element];
        if (!prop.type || prop.type === PropertyTypes.NOT_DEFINED) {
            prop.type = determineObjectType(prop.value);
        }
    }

    for (const [key, attribute] of Object.entries(domAnalyzedElement.attributes)) {
        attribute.value = treeElement.element.getAttribute(key);
    }

    for (const attribute of [...treeElement.element.attributes]) {
        if (!domAnalyzedElement.attributes[attribute.name]) {
            domAnalyzedElement.attributes[attribute.name] = {
                name: attribute.name,
                type: PropertyTypes.String,
                value: treeElement.element.getAttribute(attribute.name),
            };
        }
    }

    return domAnalyzedElement;
}

function determineObjectType(value: any): PropertyType {
    if (Array.isArray(value)) {
        return PropertyTypes.Array;
    }

    const parsedType = typeof value;
    switch (parsedType) {
        case "string":
            return PropertyTypes.String;
        case "number":
        case "bigint":
            return PropertyTypes.Number;
        case "boolean":
            return PropertyTypes.Boolean;
        case "symbol":
            return PropertyTypes.Symbol;
        case "undefined":
            return PropertyTypes.Undefined;
        case "object":
            return PropertyTypes.Object;
        case "function":
            return PropertyTypes.Function;
    }
}
