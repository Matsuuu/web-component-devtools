export type ElementId = string;

export class TreeElement {
    public id: ElementId;
    public element: Element;
    children: TreeElement[] = [];
    isCustomElement: boolean = false;
    nodeText: string = "[NODE_PARSE_FAILED]";

    lazy = true;

    constructor(element: Element) {
        this.id = generateUuidV4Like();
        this.element = element;
        this.isCustomElement = this.checkIsCustomElement(element);
        this.nodeText = this.createNodeText();

        Object.defineProperty(this, "element", {
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }

    private checkIsCustomElement(element: Element): boolean {
        const tagName = element.nodeName.toLowerCase();
        const isAttr = element.getAttribute?.("is");
        if (!isAttr && !tagName.includes("-")) {
            return false;
        }

        // :defined matches all defined elements; restrict to CE semantics
        try {
            return element.matches(":defined");
        } catch {
            return false;
        }
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

// Web crypto API is not available for insecure contexts
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
function generateUuidV4Like() {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}
