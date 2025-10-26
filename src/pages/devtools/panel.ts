import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "./components/panel-menu";
import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { RefreshCw } from "lucide";

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

      ${this.renderDevButtons()} `;
  }

  renderDevButtons() {
    // TODO: Figure out how to disable these
    return html`
      <div class="flex gap-4 fixed bottom-2 right-6">
        <button @click=${() => window.location.reload()} class="cursor-pointer">
          ${LucideIcon(RefreshCw)}
        </button>
      </div>
    `;
  }
}
