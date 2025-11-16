import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./components/panel-menu";
import "./components/debug-panel";
import "./components/toolbar";
import "./components/devtools-element-tree";
import "./components/inspector/devtools-element-inspector";
import { withTailwind } from "@src/lib/css/tailwind";
import { TABS } from "./lib/devtool-tabs";
import { TreeElement } from "../content/lib/element";
import { SignalWatcher } from "@lit-labs/signals";
import { devtoolsState } from "./state/devtools-context";
import { notifyPanelReady } from "./devtools-connections";
import { SelectResultMessage } from "../messages/select-result-message";

@customElement("wcdt-panel")
@withTailwind
export class WCDTPanel extends SignalWatcher(LitElement) {
    className = "flex h-full w-full";

    @property({})
    activePanel = TABS.ELEMENTS;

    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({})
    disconnectionMessage?: string;

    @property({})
    tabId: number | undefined = undefined;

    setConnectedTab(tabId: number) {
        this.connected = true;
        this.tabId = tabId;
    }

    disconnect(disconnectionMessage: string) {
        this.connected = false;
        this.disconnectionMessage = disconnectionMessage;
    }

    setElementTree(tree: TreeElement | undefined) {
        devtoolsState.elementTree.set(tree);
        devtoolsState.previousTreeUpdate.set(new Date());
    }

    selectElement(data: SelectResultMessage) {
        devtoolsState.selectedItemDetails.set(data.element);
    }

    protected firstUpdated(): void {
        window.panel = this;

        this.activePanel = sessionStorage.getItem("active-panel") || TABS.ELEMENTS;

        notifyPanelReady();
    }

    onPanelChanged(ev: CustomEvent) {
        this.activePanel = ev.detail.panel;
    }

    render() {
        return html` <wcdt-panel-menu
                .activePanel=${this.activePanel}
                @panel-changed=${this.onPanelChanged}
            ></wcdt-panel-menu>

            <div class="flex flex-col w-full max-w-[92%] max-h-[100vh] overflow-clip">
                <tool-bar ?connected=${this.connected} .tabId=${this.tabId}></tool-bar>
                ${this.renderPanelContent()}
            </div>

            <debug-panel></debug-panel>`;
    }

    renderPanelContent() {
        if (!this.connected && this.disconnectionMessage) {
            return html`
                <div class="w-full h-full flex flex-col items-center justify-center p-4">
                    <p>${this.disconnectionMessage}</p>
                </div>
            `;
        }

        switch (this.activePanel) {
            case TABS.ELEMENTS:
                return html`
                    <wa-split-panel
                        position="${devtoolsState.selectedItem.get() ? 50 : 100}"
                        orientation="vertical"
                        class="h-full w-full"
                    >
                        <devtools-element-tree slot="start"></devtools-element-tree>
                        <devtools-element-inspector slot="end"></devtools-element-inspector>
                    </wa-split-panel>
                `;
            default:
                return html`<div class="w-full h-full flex items-center justify-center">
                    <p>Panel content not set</p>
                </div>`;
        }
    }
}
