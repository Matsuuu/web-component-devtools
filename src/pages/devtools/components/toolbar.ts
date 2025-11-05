import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Braces, Check, FileCode, FileCode2, WifiSync } from "lucide";

@customElement("tool-bar")
@withTailwind
export class Toolbar extends LitElement {
    @property({ type: Boolean, reflect: true })
    connected = false;

    @property({ type: Boolean, reflect: true, attribute: "highlight-all" })
    highLightAll = false;

    @property({})
    tabId = "";

    className = "flex justify-between w-full border-b-gray-500 border-b-2";

    toggleHighlightAll() {
        this.highLightAll = !this.highLightAll;
        this.dispatchEvent(new CustomEvent("highlight-all-changed", { detail: { highLightAll: this.highLightAll } }));
    }

    render() {
        return html`
            <div class="flex">
                <p class="text-xs text-gray-500 flex items-center w-full p-2 gap-2">
                    ${this.connected
                        ? html` ${LucideIcon(Check, { size: 12 })} Connection established. Tab ID: ${this.tabId} `
                        : html` ${LucideIcon(WifiSync, { size: 12 })} Establishing connection... `}
                </p>
            </div>
            <div class="flex">
                <button class="flex gap-2 items-center cursor-pointer" @click=${this.toggleHighlightAll}>
                    ${this.highLightAll
                        ? html` ${LucideIcon(FileCode, { size: 16 })} Highlight All Elements `
                        : html` ${LucideIcon(Braces, { size: 16 })} Highlight Only Custom Elements `}
                </button>
            </div>
        `;
    }
}
