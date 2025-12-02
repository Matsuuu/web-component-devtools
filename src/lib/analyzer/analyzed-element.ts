export interface StaticAnalyzedElement {
    name: string;
    elementName: string;
    properties: Properties;
    attributes: Attributes;
}

export interface DomAnalyzedElement extends StaticAnalyzedElement {}

export type Attributes = Record<string, Attribute>;

export interface Attribute {
    name: string;
    type: String | Boolean;
    /**
     * Whether or not the attribute is enabled / "turned on".
     * */
    on: boolean;
    value?: string | null;
}

export type Properties = Record<string, Property>;
export type SerializedProperties = Record<string, SerializedProperty>;

type ValueOf<T> = T[keyof T];
export type PropertyType = ValueOf<typeof PropertyTypes>;

export const PropertyTypes = {
    String: "String",
    Number: "Number",
    Boolean: "Boolean",
    Undefined: "undefined",
    Object: "Object",
    Function: "Function",
    Array: "Array",
    Symbol: "Symbol",
    NOT_DEFINED: "Not Defined",
} as const;

export type SerializedPropertyType = any;

export interface Property {
    name: string;
    type: PropertyType;
    value?: any;
}

export type SerializedProperty = SerializedPrimitiveProperty | SerializedFunction;

export interface SerializedPrimitiveProperty {
    name: string;
    type: SerializedPropertyType;
    value?: SerializedPropertyType;
}

export interface SerializedFunction {
    name: string;
    type: Function;
    params: FunctionParameter[];
}

export interface FunctionParameter {
    name: string;
    type: PropertyType;
}
