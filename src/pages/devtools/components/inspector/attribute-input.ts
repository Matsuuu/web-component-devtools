import { Attribute } from "@src/lib/analyzer/analyzed-element";
import { withTailwind } from "@src/lib/css/tailwind";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createDevtoolsAttributeChangeEvent } from "../../events/devtools-inspector-event";
import { createRef, ref } from "lit/directives/ref.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { WaSelectionChangeEvent } from "@awesome.me/webawesome";
import { ChangeEvent } from "react";
import WaCheckbox from "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";

@customElement("attribute-input")
@withTailwind
export class AttributeInput extends LitElement {
    @property({ type: String, reflect: true })
    name = "";

    @property({ type: Object })
    attribute!: Attribute;

    @property({ type: Boolean, reflect: true })
    editing = false;

    @property({ type: Boolean, reflect: true, attribute: "has-checkbox" })
    hasCheckbox = false;

    _leaveListener = this.leaveEditListener.bind(this);
    inputRef = createRef<WaInput>();

    className = "flex items-center hover:bg-gray-100 focus-within:bg-gray-100";

    enterEdit() {
        this.editing = true;

        document.addEventListener("click", this._leaveListener);
    }

    leaveEditListener(event: MouseEvent) {
        const clickedThisElement = event
            .composedPath()
            .filter(target => target instanceof Element)
            .some(elem => elem === this);
        if (!clickedThisElement) {
            this.editing = false;
            document.removeEventListener("click", this._leaveListener);
            this.onValueChange();
        }
    }

    handleKeypress(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            this.editing = false;
            this.onValueChange();
        }
    }

    onValueChange() {
        const newValue = this.inputRef.value?.value;

        if (typeof newValue === "string") {
            createDevtoolsAttributeChangeEvent({
                name: this.attribute.name,
                type: "string",
                value: newValue,
            });
            // Update the UI for responsiveness. The InPage will query the new state also
            this.attribute.value = newValue;
        }
    }

    toggleAttributeOnOff(event: ChangeEvent) {
        const checked = (event.target as WaCheckbox).checked;
        createDevtoolsAttributeChangeEvent({
            name: this.attribute.name,
            type: "boolean",
            value: checked,
        });

        // Update the UI for responsiveness. The InPage will query the new state also
        this.attribute.on = checked;
    }

    render() {
        if (!this.attribute) {
            return;
        }

        return html`
            <wa-checkbox
                @change=${this.toggleAttributeOnOff}
                ?checked=${this.attribute.on}
                size="small"
                class="mr-2"
            ></wa-checkbox>
            <label class="flex cursor-auto items-center">
                <span class="text-orange-400 mr-2">${this.name}:</span>
                ${this.editing
                    ? html`
                          <wa-input
                              ${ref(this.inputRef)}
                              @keydown=${this.handleKeypress}
                              size="small"
                              value="${this.attribute.value}"
                          ></wa-input>
                      `
                    : html`<span class="truncate" @click=${this.enterEdit}>${this.attribute.value}</span>`}
            </label>
        `;
    }

    static styles = css`
        :host {
            --checkbox-visibility: hidden;
        }

        wa-checkbox {
            visibility: var(--checkbox-visibility);
            --wa-form-control-toggle-size: 1em;
        }

        wa-checkbox::part(control) {
            margin: 0;
        }

        wa-input::part(base) {
            height: 1.6em;
            padding: 0 1ch;
        }

        wa-input::part(input) {
            field-sizing: content;
        }

        wa-input {
            font-size: 1em;
            --wa-panel-border-radius: var(--wa-border-radius-s);
            --wa-focus-ring: solid 0.0875rem #3e96ff;
        }
    `;
}
