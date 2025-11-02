import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { RefreshCw } from "lucide";

@customElement("debug-panel")
@withTailwind
export class DebugPanel extends LitElement {
  autoRefreshTimeout: NodeJS.Timeout | null = null;

  get autoRefresh() {
    return sessionStorage.getItem("auto-refresh") !== null;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (this.autoRefresh) {
      this.setAutoRefreshTimeout();
    }
  }

  setAutoRefreshTimeout() {
    this.autoRefreshTimeout = setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  clearAutoRefreshTimeout() {
    if (this.autoRefreshTimeout) {
      clearTimeout(this.autoRefreshTimeout);
    }
  }

  toggleAutoRefresh(ev: InputEvent) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) {
      sessionStorage.setItem("auto-refresh", "true");
      this.setAutoRefreshTimeout();
    } else {
      sessionStorage.removeItem("auto-refresh");
      this.clearAutoRefreshTimeout();
    }
  }

  render() {
    return html`
      <div class="flex gap-4 fixed bottom-2 right-6">
        <p class="text-xs text-gray-500">
          Refreshed at ${new Date().toLocaleTimeString()}
        </p>
        <label>
          Auto-refresh
          <input
            type="checkbox"
            @input=${this.toggleAutoRefresh}
            ?checked=${this.autoRefresh}
          />
        </label>
        <button @click=${() => window.location.reload()} class="cursor-pointer">
          ${LucideIcon(RefreshCw)}
        </button>
      </div>
    `;
  }
}
