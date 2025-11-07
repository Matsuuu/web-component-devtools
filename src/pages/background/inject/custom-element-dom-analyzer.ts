import { PropertyDeclaration, PropertyDeclarations } from "lit";
import { AnalyzedElement, Properties } from "../parsing/analyzed-element";

export function analyzeDomElement(elementName: string) {
    // Pack all of these function with this function since we're going to inject this all
    function isLitElement(classData: CustomElementConstructor): classData is LitLikeElement {
        return isLitInstalled() && classData.hasOwnProperty("elementProperties");
    }

    function isLitInstalled() {
        return window["litElementVersions"] && window["litElementVersions"].length > 0;
    }

    function analyzeLitElement(classData: LitLikeElement): AnalyzedElement {
        const properties: Properties = {};
        for (const [key, val] of classData.elementProperties.entries()) {
            properties[key] = {
                name: key,
                type: val.type ?? undefined,
                value: undefined,
            };
        }

        return {
            ...analyzeHTMLElement(classData),
            properties,
        };
    }

    function analyzeHTMLElement(classData: CustomElementConstructor | null) {
        return {
            name: classData?.name ?? elementName,
            elementName: elementName,
        };
    }

    const classData = window.customElements.get(elementName);
    if (!classData) {
        return analyzeHTMLElement(null);
    }

    if (isLitElement(classData)) {
        return analyzeLitElement(classData);
    }
}

interface LitLikeElement extends CustomElementConstructor {
    elementProperties: Map<string, PropertyDeclaration>;
}

declare global {
    interface Window {
        litElementVersions: string[];
    }
}
