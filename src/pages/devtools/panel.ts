import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./components/panel-menu";
import "./components/debug-panel";
import "./components/toolbar";
import "./components/devtools-element.tree";
import { withTailwind } from "@src/lib/css/tailwind";
import { TABS } from "./lib/devtool-tabs";
import { TreeElement } from "../content/lib/element";

@customElement("wcdt-panel")
@withTailwind
export class WCDTPanel extends LitElement {
    className = "flex h-full w-full";

    @property({})
    activePanel = TABS.ELEMENTS;

    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({})
    tabId: number | undefined = undefined;

    @property({ type: Object })
    tree?: TreeElement;

    @property({ type: Boolean })
    highLightAll = false;

    setConnectedTab(tabId: number) {
        this.connected = true;
        this.tabId = tabId;
    }

    setElementTree(tree: TreeElement) {
        this.tree = tree;
    }

    protected firstUpdated(): void {
        window.panel = this;

        // TODO: Better way for this
        this.className.split(" ").forEach(sty => {
            this.classList.add(sty);
        });

        this.activePanel = sessionStorage.getItem("active-panel") || TABS.ELEMENTS;
    }

    onHighLightAllChange(ev: CustomEvent) {
        this.highLightAll = ev.detail.highLightAll;
    }

    render() {
        return html` <wcdt-panel-menu .activePanel=${this.activePanel}></wcdt-panel-menu>

            <div class="flex flex-col w-full max-w-[92%]">
                <tool-bar
                    @highlight-all-changed=${this.onHighLightAllChange}
                    ?connected=${this.connected}
                    ?highlight-all=${this.highLightAll}
                    .tabId=${this.tabId}
                ></tool-bar>
                ${this.renderPanelContent()}
            </div>

            <debug-panel></debug-panel>`;
    }

    renderPanelContent() {
        switch (this.activePanel) {
            case TABS.ELEMENTS:
                return html`
                    <devtools-element-tree
                        ?highlight-all=${this.highLightAll}
                        .tree=${this.tree}
                    ></devtools-element-tree>
                `;
            default:
                return html`<div class="w-full h-full flex items-center justify-center">
                    <p>Panel content not set</p>
                </div>`;
        }
    }
}
