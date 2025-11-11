import { PropertyDeclaration } from "lit";
import { StaticAnalyzedElement, Properties, Attributes } from "../parsing/analyzed-element";

// TODO: This is currently injected in a jank way. Now that we have the inpage script, we can just throw this in there.
//
// TODO: After the static analysis, run a tour through the props and attributes on the actual DOM node and
// fetch the values. While we're there, we can also try and look around if we can determine is an attribute
// is of type string or boolean. Or do we have to do that? Can we just make it a textbox with a checkbox which toggles it?

export function analyzeDomElement(elementName: string): StaticAnalyzedElement {
    // Pack all of these function with this function since we're going to inject this all
    function isLitElement(classData: CustomElementConstructor): classData is LitLikeElement {
        return isLitInstalled() && classData.hasOwnProperty("elementProperties");
    }

    function isLitInstalled() {
        return window["litElementVersions"] && window["litElementVersions"].length > 0;
    }

    function analyzeLitElement(classData: LitLikeElement): StaticAnalyzedElement {
        const properties: Properties = {};
        for (const [key, val] of classData.elementProperties.entries()) {
            properties[key] = {
                name: key,
                type: val.type ?? undefined,
                value: undefined,
            };
        }

        const attributes: Attributes = {};
        if (classData.observedAttributes) {
            for (const attributeName of classData.observedAttributes) {
                properties[attributeName] = {
                    name: attributeName,
                    type: String, // TODO: Can also be boolean, we need to figure out, but it's after we get the value
                    value: undefined,
                };
            }
        }

        return {
            ...analyzeHTMLElement(classData),
            properties,
            attributes,
        };
    }

    function analyzeHTMLElement(classData: CustomElementConstructor | null): StaticAnalyzedElement {
        return {
            name: classData?.name ?? elementName,
            elementName: elementName,
            properties: {},
            attributes: {},
        };
    }

    const classData = window.customElements.get(elementName);
    if (!classData) {
        return analyzeHTMLElement(null);
    }

    if (isLitElement(classData)) {
        return analyzeLitElement(classData);
    }

    return analyzeHTMLElement(null);
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
