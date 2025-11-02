import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "./components/panel-menu";
import "./components/debug-panel";
import { withTailwind } from "@src/lib/css/tailwind";

@customElement("wcdt-panel")
@withTailwind
export class WCDTPanel extends LitElement {
  className = "flex h-full";

  protected firstUpdated(): void {
    // TODO: Better way for this
    this.className.split(" ").forEach((sty) => {
      this.classList.add(sty);
    });
  }

  render() {
    return html`<wcdt-panel-menu></wcdt-panel-menu>

      <debug-panel></debug-panel>`;
  }
}
