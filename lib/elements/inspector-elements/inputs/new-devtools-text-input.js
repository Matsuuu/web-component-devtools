import { css, html, LitElement } from 'lit';
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
        };
    }

    constructor() {
        super();

        this.placeholder = '';
        this.value = '';
        this.property = null;
        this.label = '';
        this.type = 'text';
        this.propertyPath = [];
    }

    _triggerInput(e) {
        e.stopPropagation();
        this.value = e.target.value;

        this.dispatchEvent(
            new CustomEvent('devtools-input', {
                detail: { value: this.value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
    }

    getValue() {
        return this.shadowRoot.querySelector('input').value;
    }

    render() {
        return html`${this.label.length > 0 ? html` <label>${this.label}:</label> ` : ''}
            <input
                @input=${e => this._triggerInput(e)}
                type="${this.type}"
                placeholder=${this.placeholder}
                .value=${this.value}
            />

            <sl-input 
                @sl-input="${e => this._triggerInput(e)}"
                placeholder="Filter by name" 
                type="text"
                .value=${this.value}
                >
                <sl-icon name="search" slot="prefix"></sl-icon>
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
            }
        `;
    }
}

if (!customElements.get('new-devtools-text-input')) {
    customElements.define('new-devtools-text-input', NewDevToolsTextInput);
}
