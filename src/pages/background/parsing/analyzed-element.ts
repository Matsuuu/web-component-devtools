export interface AnalyzedElement {
    properties: Properties;
}

export type Properties = Record<string, Property>;

export interface Property {
    name: string;
    type: String | Number | Array<any> | Object | undefined;
    value?: any;
}
