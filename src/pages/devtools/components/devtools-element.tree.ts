import { stylizeNodeText } from "@src/lib/code/stylize-node-text";
import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { TreeElement } from "@src/pages/content/lib/element";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ChevronRight } from "lucide";

@customElement("devtools-element-tree")
@withTailwind
export class DevtoolsElementTree extends LitElement {
    @property({ type: Object })
    tree?: TreeElement;

    @property({ type: Boolean, reflect: true, attribute: "highlight-all" })
    highLightAll = false;

    render() {
        const baseLayer = this.tree?.children;
        if (!baseLayer || baseLayer?.length <= 0) {
            return "";
        }
        return html` <wa-tree> ${baseLayer.map(elem => this.renderItem(elem))} </wa-tree> `;
    }

    renderItem(element: TreeElement): TemplateResult {
        console.log(element);
        return html`
            <wa-tree-item>
                ${unsafeHTML(stylizeNodeText(element.nodeText, element.isCustomElement))}
                ${element.children.map(childElem => this.renderItem(childElem))}
                ${LucideIcon(ChevronRight, { size: 16, slot: "expand-icon" })}
                ${LucideIcon(ChevronRight, { size: 16, slot: "collapse-icon" })}
            </wa-tree-item>
        `;
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
