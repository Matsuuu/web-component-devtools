import { SignalWatcher } from "@lit-labs/signals";
import { withTailwind } from "@src/lib/css/tailwind";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { devtoolsState } from "../state/devtools-context";
import { LucideIcon } from "@src/lib/icons/lucide";
import { X } from "lucide";

@customElement("devtools-element-inspector")
@withTailwind
export class DevtoolsElementInspector extends SignalWatcher(LitElement) {
    get selectedItem() {
        // Force this to not be null here for code clarity
        return devtoolsState.selectedItem.get()!;
    }

    render() {
        if (!this.selectedItem) {
            return "";
        }

        return html`${this.renderTopBar()}`;
    }

    closeInspector() {
        devtoolsState.selectedItem.set(undefined);
    }

    renderTopBar() {
        return html`
            <div class="flex p-2">
                <h2 class="text-lg font-bold text-orange-400">${this.selectedItem.nodeName}</h2>

                <wa-button @click=${this.closeInspector} variant="neutral" appearance="plain"
                    >${LucideIcon(X)}</wa-button
                >
            </div>
        `;
    }
}
