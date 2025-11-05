import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Check, WifiSync } from "lucide";

@customElement("connection-info")
@withTailwind
export class ConnectionInfo extends LitElement {
    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({})
    tabId = "";

    className = "flex w-full border-b-gray-500 border-b-2";

    render() {
        return html`
            <p class="text-xs text-gray-500 flex items-center w-full p-2 gap-2">
                ${this.connected
                    ? html` ${LucideIcon(Check, 12)} Connection established. Tab ID: ${this.tabId} `
                    : html` ${LucideIcon(WifiSync, 12)} Establishing connection... `}
            </p>
        `;
    }
}
