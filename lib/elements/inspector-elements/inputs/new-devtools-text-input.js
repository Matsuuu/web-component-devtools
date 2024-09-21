import { css, html, LitElement } from "lit";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "../indicators/devtools-property-indicators.js";

export class NewDevToolsTextInput extends LitElement {
    static get properties() {
        return {
            placeholder: { type: String },
            value: { type: String, reflect: true },
            type: { type: String },
            label: { type: String },
            propertyPath: { type: Array },
            property: { type: Object },
            inspector: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();

        this.placeholder = "";
        this.value = "";
        this.property = null;
        this.label = "";
        this.type = "text";
        this.propertyPath = [];
        this.inspector = false;
    }

    _triggerInput(e) {
        e.stopPropagation();
        this.value = e.target.value;

        this.dispatchEvent(
            new CustomEvent("devtools-input", {
                detail: { value: this.value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
    }

    getValue() {
        return this.shadowRoot.querySelector("input").value;
    }

    render() {
        return html`
            <sl-input
                @sl-input="${e => this._triggerInput(e)}"
                label="${this.label.length > 0 ? this.label : ""}"
                placeholder="${this.inspector ? "" : "Filter by name"}"
                type="text"
                .value=${this.value}
                clearable
                size="small"
            >
                ${this.inspector ? html`` : html`<sl-icon name="search" slot="prefix"></sl-icon>`}
            </sl-input>
            <devtools-property-indicators .property=${this.property}></devtools-property-indicators>
        `;
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                font-size: var(--font-size);
            }

            sl-input {
                --sl-input-border-radius-small: 0px;
                --sl-input-border-width: 0px;
                width: 100%;
            }

            sl-input:focus-within::part(base) {
                border: 1px solid var(--highlight);
                background: var(--darker-background-hover-color);
            }

            sl-input::part(form-control) {
                display: flex;
            }

            sl-input::part(base) {
                color: var(--button-color);
                background: var(--background-color);
                height: 100%;
                width: 100%;
                font-size: var(--font-size);
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 1px solid var(--border-color);
                outline: none;
                margin-left: 1rem;
            }

            sl-input::part(form-control-input) {
                flex: 1;
            }

            sl-input::part(form-control-label) {
                color: var(--secondary);
            }

            sl-input::part(form-control) {
                width: 97%;
            }
        `;
    }
}

if (!customElements.get("devtools-text-input")) {
    customElements.define("devtools-text-input", NewDevToolsTextInput);
}
