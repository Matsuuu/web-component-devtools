import { css, html, LitElement } from "lit";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

export class DevToolsCheckbox extends LitElement {
    static get properties() {
        return {
            checked: { type: Boolean, reflect: true },
            label: { type: String },
            propertyPath: { type: Array },
            property: { type: Object },
        };
    }

    constructor() {
        super();

        this.checked = false;
        this.label = "";
        this.property = null;
        this.propertyPath = [];
    }

    updated(_changed) {
        // The input doesn't seem to update checked status by default
        if (_changed.has("checked")) {
            this.shadowRoot.querySelector("input").checked = this.checked;
        }
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.checked;

        this.dispatchEvent(
            new CustomEvent("devtools-input", {
                detail: { value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
    }

    render() {
        return html`
            <sl-checkbox @input=${e => this._triggerInput(e)} ?checked=${this.checked}>${this.label}</sl-checkbox>
            <devtools-property-indicators .property=${this.property}></devtools-property-indicators>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            sl-checkbox {
                font-size: 1rem;
                --toggle-size: 1rem;
            }
        `;
    }
}

if (!customElements.get("devtools-checkbox")) {
    customElements.define("devtools-checkbox", DevToolsCheckbox);
}
