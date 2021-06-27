import { css, html, LitElement } from 'lit';

export class DevtoolsTextInput extends LitElement {
    static get properties() {
        return {
            placeholder: { type: String },
            value: { type: String, reflect: true },
            name: { type: String },
            type: { type: String },
            label: { type: String },
        };
    }

    constructor() {
        super();

        this.placeholder = '';
        this.value = '';
        this.name = '';
        this.label = '';
        this.type = 'text';
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.value;

        this.dispatchEvent(new CustomEvent('devtools-input', { detail: { value } }));
    }

    getValue() {
        return this.shadowRoot.querySelector("input").value;
    }

    render() {
        return html`${this.label.length > 0 ? html`<label>${this.label}:</label>` : ''}
            <input
                @input=${e => this._triggerInput(e)}
                type="${this.type}"
                placeholder=${this.placeholder}
                .value=${this.value}
            /> `;
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            input {
                color: var(--button-color);
                height: 100%;
                width: 100%;
                font-size: var(--font-size);
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 1px solid #eeeeee;
                outline: none;
            }

            input:focus {
                border: 1px solid var(--highlight);
                background: #d8e9ef;
            }

            label {
                font-size: 0.8rem;
                padding: 3px 1rem 3px 3px;
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

if (!customElements.get('devtools-text-input')) {
    customElements.define('devtools-text-input', DevtoolsTextInput);
}
