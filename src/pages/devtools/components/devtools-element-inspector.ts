import { SignalWatcher } from "@lit-labs/signals";
import { withTailwind } from "@src/lib/css/tailwind";
import { css, html, LitElement } from "lit";
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

    className = "flex flex-col";

    renderTopBar() {
        return html`
            <div class="flex justify-between p-2">
                <div>
                    <h2 class="text-lg font-bold text-orange-400">${this.selectedItem.nodeName}</h2>
                </div>

                <div>
                    <wa-button size="small" @click=${this.closeInspector} variant="neutral" appearance="plain"
                        >${LucideIcon(X, { size: 12 })}</wa-button
                    >
                </div>
            </div>
            <wa-divider style="--width: 2px;" class="h-[2px] bg-gray-300"></wa-divider>

            <div class="flex-col p-4">
                <div class="flex flex-col gap-2">
                    <h3 class="text-md font-semibold">Properties</h3>
                </div>
                <div class="flex flex-col gap-2">
                    <h3 class="text-md font-semibold">Attributes</h3>
                </div>
            </div>
        `;
    }

    static styles = css`
        wa-button[size="small"] {
            --wa-form-control-height: 1.5rem;
            --wa-form-control-padding-inline: 0.5rem;
        }
    `;
}
