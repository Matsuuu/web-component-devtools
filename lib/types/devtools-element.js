/**
 * @typedef DevToolsElement
 * CEM props
 * @property {String} name
 * @property {String} [tagName]
 * @property {import('custom-elements-manifest/schema').Reference} [parentClass]
 * @property {Array<import('custom-elements-manifest/schema').Attribute>} [attributes]
 * @property {Array<import('custom-elements-manifest/schema').ClassField>} [properties]
 * @property {Array<import('custom-elements-manifest/schema').Event>} [events]
 * @property {Array<import('custom-elements-manifest/schema').ClassMethod>} [methods]
 * Devtools props
 * @property { import('custom-element-tree').CustomElementNodeInMessageFormat } node
 * @property { Number } [indexInDevTools]
 * @property { Number } [typeInDevTools]
 * @property { Object.<string, any> } [attributeValues]
 * @property { Object.<string, any> } [propertyValues]
 * @property { String } [declaration]
 *
 * Firefox props
 * @property { Object } [wrappedJSObject]
 * */

/**
 * @param { import('custom-element-tree').CustomElementNodeInMessageFormat } node
 * @returns { DevToolsElement }
 * */
export function devToolsElementFromNode(node) {
    return {
        name: node.tagName,
        tagName: node.tagName,
        node: node
    }
}
