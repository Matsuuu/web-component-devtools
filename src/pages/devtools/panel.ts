import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./components/panel-menu";
import "./components/debug-panel";
import "./components/connection-info";
import { withTailwind } from "@src/lib/css/tailwind";
import { TABS } from "./lib/devool-tabs";

@customElement("wcdt-panel")
@withTailwind
export class WCDTPanel extends LitElement {
    className = "flex h-full";

    @property({})
    activePanel = TABS.ELEMENTS;

    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({})
    tabId: number | undefined = undefined;

    setConnectedTab(tabId: number) {
        this.connected = true;
        this.tabId = tabId;
        this.requestUpdate();
    }

    protected firstUpdated(): void {
        window.panel = this;

        // TODO: Better way for this
        this.className.split(" ").forEach(sty => {
            this.classList.add(sty);
        });

        this.activePanel = sessionStorage.getItem("active-panel") || TABS.ELEMENTS;
    }

    render() {
        return html` <wcdt-panel-menu .activePanel=${this.activePanel}></wcdt-panel-menu>

            <div class="flex flex-col">
                <connection-info ?connected=${this.connected} .tabId=${this.tabId}></connection-info>
            </div>

            <debug-panel></debug-panel>`;
    }
}
