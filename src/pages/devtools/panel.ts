import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./components/panel-menu";
import "./components/debug-panel";
import { withTailwind } from "@src/lib/css/tailwind";
import { TABS } from "./lib/devool-tabs";

@customElement("wcdt-panel")
@withTailwind
export class WCDTPanel extends LitElement {
  className = "flex h-full";

  @property({})
  activePanel = TABS.ELEMENTS;

  protected firstUpdated(): void {
    // TODO: Better way for this
    this.className.split(" ").forEach((sty) => {
      this.classList.add(sty);
    });

    this.activePanel = sessionStorage.getItem("active-panel") || TABS.ELEMENTS;
  }

  render() {
    return html` <wcdt-panel-menu
        .activePanel=${this.activePanel}
      ></wcdt-panel-menu>

      <debug-panel></debug-panel>`;
  }
}
