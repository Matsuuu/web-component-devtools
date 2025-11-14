import { StaticAnalyzedElement, Properties, Attributes, PropertyTypes } from "../../../lib/analyzer/analyzed-element";
import { TreeElement } from "../../..//pages/content/lib/element";
import { PropertyDeclaration } from "lit";

// TODO: After the static analysis, run a tour through the props and attributes on the actual DOM node and
// fetch the values. While we're there, we can also try and look around if we can determine is an attribute
// is of type string or boolean. Or do we have to do that? Can we just make it a textbox with a checkbox which toggles it?

export function analyzeSelectedElement(element: TreeElement): StaticAnalyzedElement {
    // Pack all of these function with this function since we're going to inject this all
    function analyzeLitElement(classData: LitLikeElement): StaticAnalyzedElement {
        const properties: Properties = {};
        for (const [key, val] of classData.elementProperties.entries()) {
            properties[key] = {
                name: key,
                type: PropertyTypes.NOT_DEFINED,
                value: undefined,
            };
        }

        const attributes: Attributes = {};
        if (classData.observedAttributes) {
            for (const attributeName of classData.observedAttributes) {
                attributes[attributeName] = {
                    name: attributeName,
                    type: PropertyTypes.String, // TODO: Can also be boolean, we need to figure out, but it's after we get the value
                    value: undefined,
                };
            }
        }

        return {
            ...analyzeHTMLElement(classData),
            // TODO: ElementName should be from class
            properties,
            attributes,
        };
    }

    function analyzeHTMLElement(classData: CustomElementConstructor | null): StaticAnalyzedElement {
        return {
            name: classData?.name ?? element.nodeName,
            elementName: element.nodeName,
            properties: {},
            attributes: {},
        };
    }

    const classData = window.customElements.get(element.nodeName);
    if (!classData) {
        return analyzeHTMLElement(null);
    }

    if (isLitElement(classData)) {
        return analyzeLitElement(classData);
    }

    return analyzeHTMLElement(null);
}

function isLitElement(classData: CustomElementConstructor): classData is LitLikeElement {
    return isLitInstalled() && classData.hasOwnProperty("elementProperties");
}

function isLitInstalled() {
    return window["litElementVersions"] && window["litElementVersions"].length > 0;
}

interface CustomElement extends CustomElementConstructor {
    observedAttributes: null | string[];
}

interface LitLikeElement extends CustomElement {
    elementProperties: Map<string, PropertyDeclaration>;
}

declare global {
    interface Window {
        litElementVersions: string[];
    }
}
