import { SignalWatcher } from "@lit-labs/signals";
import { withTailwind } from "@src/lib/css/tailwind";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { devtoolsState } from "../../state/devtools-context";
import { LucideIcon } from "@src/lib/icons/lucide";
import { X } from "lucide";
import "./attribute-input";

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

    className = "flex flex-col overflow-auto";

    get selectedItemProperties() {
        return devtoolsState.selectedItemDetails.get()?.properties ?? {};
    }

    get selectedItemAttributes() {
        return devtoolsState.selectedItemDetails.get()?.attributes ?? {};
    }

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

            <div class="flex-col p-4 pb-16">
                <div class="flex flex-col gap-2" id="attributes">
                    <h3 class="text-md font-semibold">Properties</h3>
                    <ul>
                        ${Object.entries(this.selectedItemProperties).map(([key, prop]) => html` <li>${key}</li> `)}
                    </ul>
                </div>
                <div class="flex flex-col gap-2" id="attributes">
                    <h3 class="text-md font-semibold">Attributes</h3>

                    <ul>
                        ${Object.entries(this.selectedItemAttributes).map(
                            ([key, prop]) => html`
                                <li class="mb-1">
                                    <attribute-input has-checkbox name="${key}" .attribute="${prop}"></attribute-input>
                                </li>
                            `,
                        )}
                    </ul>
                </div>
            </div>
        `;
    }

    static styles = css`
        wa-button[size="small"] {
            --wa-form-control-height: 1.5rem;
            --wa-form-control-padding-inline: 0.5rem;
        }

        #attributes:hover attribute-input {
            --checkbox-visibility: visible;
        }
    `;
}
