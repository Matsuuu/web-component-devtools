import {
    PropertyType,
    SerializedProperties,
    DomAnalyzedElement,
    Properties,
    Property,
    SerializedProperty,
    PropertyTypes,
    Attributes,
} from "../../../lib/analyzer/analyzed-element";

const NO_SERIALIZATION_NEEDED_TYPES = new Set<PropertyType>([
    PropertyTypes.String,
    PropertyTypes.Number,
    PropertyTypes.Boolean,
    PropertyTypes.Undefined,
]);

export class SerializedAnalyzedElement {
    id: string;
    name: string;
    elementName: string;
    attributes: Attributes;
    properties: SerializedProperties;

    constructor(domAnalyzedElement: DomAnalyzedElement) {
        this.id = domAnalyzedElement.id;
        this.name = domAnalyzedElement.name;
        this.elementName = domAnalyzedElement.elementName;
        this.attributes = domAnalyzedElement.attributes;
        this.properties = this.#serializeProperties(domAnalyzedElement.properties);
    }

    #serializeProperties(properties: Properties): SerializedProperties {
        const serializedProperties: SerializedProperties = {};

        for (const [key, prop] of Object.entries(properties)) {
            const serializedProp = this.#serializeProperty(prop);
            serializedProperties[key] = serializedProp;
        }

        return serializedProperties;
    }

    #serializeProperty(prop: Property): SerializedProperty {
        if (NO_SERIALIZATION_NEEDED_TYPES.has(prop.type)) {
            return prop;
        }
        if (prop.type === PropertyTypes.String) {
        }

        if (prop.type === PropertyTypes.Function) {
            return {
                name: prop.name,
                type: PropertyTypes.Function,
                params: [], // TODO: Maybe get these from CEM or just leave as is and let user somehow pass these
            };
        }

        if (prop.type === PropertyTypes.Array) {
            return {
                name: prop.name,
                type: PropertyTypes.Array,
                value: prop.value.map(this.#serializeProperty),
            };
        }

        if (prop.type === PropertyTypes.Object) {
            return {
                name: prop.name,
                type: PropertyTypes.Object,
                value: JSON.parse(JSON.stringify(prop.value, this.#createJsonSerializerHelper())),
            };
        }

        return prop;
    }

    #createJsonSerializerHelper() {
        const circuralReplacement = "[ Circural ]";
        const seen = new WeakSet();
        return (_key: any, value: any) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) return circuralReplacement;
                seen.add(value);
            }
            if (typeof value === "function") {
                return this.#serializeProperty({
                    name: _key,
                    type: PropertyTypes.Function,
                    value: value,
                });
            }
            // TODO: Do we need to run everything through the serializeProperty here or nah?
            return value;
        };
    }
}
