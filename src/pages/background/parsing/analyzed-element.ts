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
    value?: string | boolean;
}

export type Properties = Record<string, Property>;

export interface Property {
    name: string;
    type: String | Number | Array<any> | Object | undefined;
    value?: any;
}
