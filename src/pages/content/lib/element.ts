export class TreeElement {
    children: TreeElement[] = [];
    isCustomElement: boolean = false;
    nodeText: string = "[NODE_PARSE_FAILED]";

    constructor(public element: Element) {
        // TODO: Maybe check the customElements -api if we end up injecting this
        this.isCustomElement = element.nodeName.includes("-");
        this.nodeText = this.createNodeText();
    }

    createNodeText() {
        const nodeName = this.element.nodeName.toLowerCase();
        const attributesString = [...this.element.attributes]
            .map(attribute => {
                return `${attribute.name}="${attribute.value}"`;
            })
            .join(" ");

        return attributesString.trim().length > 0 //
            ? `<${nodeName} ${attributesString}>`
            : `<${nodeName}>`;
    }

    public addChild(treeElement: TreeElement) {
        this.children.push(treeElement);
    }
}
