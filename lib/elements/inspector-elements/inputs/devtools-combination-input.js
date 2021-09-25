import { css, html, LitElement } from 'lit';
import '../indicators/devtools-property-indicators.js';
import { live } from "lit/directives/live.js";

export class DevToolsCombinationInput extends LitElement {
    static get properties() {
        return {
            placeholder: { type: String },
            value: { type: String, reflect: true },
            checked: { type: Boolean, reflect: true },
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
        this.checked = false;
        this.property = null;
        this.label = '';
        this.type = 'text';
        this.propertyPath = [];
        this.checkedboxElem = null;

        this.title = "Attributes can be boolean or string types. Devtools provides you with both here so you can toggle them as you wish";
    }

    firstUpdated() {
        this.checkedboxElem = this.shadowRoot.querySelector("input[type='checkbox']");
    }

    /**
     * @param {any} e
     * @param {boolean} [isCheckbox]
     */
    _triggerInput(e, isCheckbox) {
        e.stopPropagation();
        const value = isCheckbox ? e.target.checked : e.target.value;

        this.dispatchEvent(
            new CustomEvent('devtools-input', {
                detail: { value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
        if (!isCheckbox) {
            this.checked = value != null && value.length > 0;
            this.checkedboxElem.checked = this.checked;
        }
    }

    getValue() {
        return this.shadowRoot.querySelector('input').value;
    }

    render() {
        return html`${this.label.length > 0 ? html` <label>${this.label}:</label> ` : ''}
            <input @input=${e => this._triggerInput(e, true)} type="checkbox" ?checked=${live(this.checked)} />
            <span></span>
            <input
                @input=${e => this._triggerInput(e)}
                type="${this.type}"
                placeholder=${this.placeholder}
                .value=${this.value}
            />
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

            input[type='text'] {
                color: var(--button-color);
                height: 100%;
                width: 100%;
                font-size: var(--font-size);
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 1px solid #eeeeee;
                outline: none;
            }

            input[type='checkbox'] {
                color: var(--button-color);
                min-height: 0.8rem;
                min-width: 0.8rem;
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 3px solid #eeeeee;
                outline: none;
                margin-left: 1rem;
            }

            input:focus {
                border: 1px solid cornflowerblue;
            }

            input:focus {
                border: 1px solid var(--highlight);
                background: #d8e9ef;
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

if (!customElements.get('devtools-combination-input')) {
    customElements.define('devtools-combination-input', DevToolsCombinationInput);
}
