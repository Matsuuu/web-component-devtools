import { WaCollapseEvent, WaExpandEvent, WaLazyLoadEvent } from "@awesome.me/webawesome";
import WaTreeItem from "@awesome.me/webawesome/dist/components/tree-item/tree-item.js";
import { stylizeNodeText } from "@src/lib/code/stylize-node-text";
import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { TreeElement } from "@src/pages/content/lib/element";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ChevronRight } from "lucide";

const expansionMap = new WeakSet<TreeElement>();

@customElement("devtools-element-tree")
@withTailwind
export class DevtoolsElementTree extends LitElement {
    className = "h-full overflow-auto";

    @property({ type: Object })
    tree?: TreeElement;

    @property({ type: Boolean, reflect: true, attribute: "highlight-all" })
    highLightAll = false;

    onExpand(ev: WaExpandEvent, element: TreeElement) {
        console.log({ ev, element });
        expansionMap.add(element);
    }

    onCollapse(ev: WaCollapseEvent, element: TreeElement) {
        console.log({ ev, element });
        expansionMap.delete(element);
    }

    render() {
        const baseLayer = this.tree?.children;
        if (!baseLayer || baseLayer?.length <= 0) {
            return "";
        }
        return html` <wa-tree> ${baseLayer.map(elem => this.renderItem(elem))} </wa-tree> `;
    }

    renderItem(element: TreeElement): TemplateResult {
        return html`
            <wa-tree-item
                ?lazy=${!expansionMap.has(element) && element.children.length > 0}
                ?expanded=${expansionMap.has(element)}
                @wa-lazy-load=${(ev: WaLazyLoadEvent) => this.loadTreeBranch(ev, element)}
                @wa-expand=${(ev: WaExpandEvent) => this.onExpand(ev, element)}
                @wa-collapse=${(ev: WaCollapseEvent) => this.onCollapse(ev, element)}
            >
                ${unsafeHTML(stylizeNodeText(element.nodeText, element.isCustomElement))}
                ${element.lazy ? "" : element.children.map(childElem => this.renderItem(childElem))}
                ${LucideIcon(ChevronRight, { size: 16, slot: "expand-icon" })}
                ${LucideIcon(ChevronRight, { size: 16, slot: "collapse-icon" })}
            </wa-tree-item>
        `;
    }

    loadTreeBranch(ev: WaLazyLoadEvent, element: TreeElement) {
        element.lazy = false;
        (ev.target as WaTreeItem).lazy = false;
        this.requestUpdate();
    }

    static styles = css`
        :host {
        }

        wa-tree-item::part(label) {
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
        }

        wa-tree-item::part(expand-button) {
            width: 1em;
            height: 1em;
        }

        .tag {
            padding-left: 0 !important;
        }

        :host([highlight-all]) .tag,
        .custom-element {
            color: var(--primary-element-color);
        }

        .tag:not(.custom-element) {
            color: var(--not-highlighted-element-color);
        }

        .attr-key {
            color: var(--secondary-element-color);
            padding-left: 1ch;
        }

        .attr-value {
            color: var(--element-value-color);
        }
    `;
}
