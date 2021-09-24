import { css, html, LitElement } from 'lit';
import '../indicators/devtools-property-indicators.js';

export class DevToolsUnionInput extends LitElement {
    static get properties() {
        return {
            value: { type: String, reflect: true },
            label: { type: String },
            propertyPath: { type: Array },
            property: { type: Object },
            options: { type: Array },
            selected: { type: Number }
        };
    }

    constructor() {
        super();

        this.value = '';
        this.property = null;
        this.label = '';
        this.propertyPath = [];
        this.options = [];
        this.selected = 0;
    }

    updated(_changedProperties) {
        if (_changedProperties.has('property')) {
            this._parseOptions();
        }
    }

    _parseOptions() {
        const values = this.property?.type?.text?.split('|');
        if (values) {
            this.options = values.map(val => {
                val = val.trim();
                val = val.replace(/['"]/g, '');
                return val;
            });
        }
        this._selectCurrentValue();
    }

    _triggerInput(e) {
        e.stopPropagation();
        const selectElem = e.target;
        const value = selectElem.options[selectElem.selectedIndex].text;

        this.dispatchEvent(
            new CustomEvent('devtools-input', {
                detail: { value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
    }

    _selectCurrentValue() {
        for (let i = 0; i < this.options.length; i++) {
            const opt = this.options[i];
            if (opt === this.value) {
                this.selected = i;
                break;
            }
        }
    }

    getValue() {
        return this.shadowRoot.querySelector('input').value;
    }

    render() {
        return html`${this.label.length > 0 ? html` <label>${this.label}:</label> ` : ''}
            <select @change=${e => this._triggerInput(e)}>
                ${this.options.map((opt, i) => html`<option ?selected=${i === this.selected} value="${i}">${opt}</option>`)}
            </select>
            <devtools-property-indicators .property=${this.property}></devtools-property-indicators> `;
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            select {
                color: var(--button-color);
                height: 100%;
                width: 100%;
                font-size: var(--font-size);
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 1px solid #eeeeee;
                outline: none;
                margin-left: 1rem;
                background: var(--background-color);
            }

            select:focus {
                border: 1px solid var(--highlight);
                border-radius: 0px;
            }

            label {
                font-size: 0.8rem;
                padding: 3px 0 3px 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
            }

            :host([nolabel]) input {
                flex-basis: 100%;
            }
            :host([nolabel]) label {
                flex-basis: 0;
            }
        `;
    }
}

if (!customElements.get('devtools-union-input')) {
    customElements.define('devtools-union-input', DevToolsUnionInput);
}
