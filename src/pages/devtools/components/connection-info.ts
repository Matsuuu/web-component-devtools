import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check, WifiSync } from "lucide";

@customElement("connection-info")
@withTailwind
export class ConnectionInfo extends LitElement {
    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({})
    tabId = "";

    className = "flex";

    updated(changedProps: PropertyValues) {
        if (changedProps.has("connected")) {
            console.log("connected changed:", this.connected);
        }
    }

    render() {
        return html`
            <p class="text-xs text-gray-500 flex items-center w-full p-2 gap-2">
                ${this.connected
                    ? html` ${LucideIcon(Check)} Connection established. Tab ID: ${this.tabId} `
                    : html` ${LucideIcon(WifiSync)} Establishing connection... `}
            </p>
        `;
    }
}
