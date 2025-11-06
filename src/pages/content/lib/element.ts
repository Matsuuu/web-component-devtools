type ElementId = string;

export class TreeElement {
    public id: ElementId;
    children: TreeElement[] = [];
    isCustomElement: boolean = false;
    nodeText: string = "[NODE_PARSE_FAILED]";

    // This variable is used for lazy loading content in the three view
    lazy = true;

    constructor(public element: Element) {
        this.id = generateUuidV4Like();
        this.isCustomElement = this.checkIsCustomElement(element);
        this.nodeText = this.createNodeText();
    }

    private checkIsCustomElement(element: Element): boolean {
        const tagName = element.nodeName.toLowerCase();
        if (!tagName.includes("-")) {
            return false;
        }
        
        // Try customElements.get() first if customElements registry is available
        if (typeof customElements !== 'undefined' && customElements !== null) {
            try {
                const customElementDef = customElements.get(tagName);
                if (customElementDef !== undefined) {
                    return true;
                }
            } catch (e) {
                // TODO: Implement skip list, related issue: https://github.com/Matsuuu/web-component-devtools/issues/73
                // Example element: <svg:font-face>
                // customElements.get() can throw for invalid tag names
            }
        }
        
        // Fallback to constructor check
        try {
            return element.constructor !== HTMLElement && element.constructor !== Element;
        } catch (e) {
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
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
      c,
    ) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }