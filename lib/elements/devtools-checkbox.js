import { css, html, LitElement } from 'lit-element';

export class DevtoolsCheckbox extends LitElement {
    static get properties() {
        return {
            value: { type: String },
            name: { type: String },
            label: { type: String },
        };
    }

    constructor() {
        super();

        this.value = '';
        this.name = '';
        this.label = '';
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.checked;

        this.dispatchEvent(new CustomEvent('devtools-input', { detail: { value } }));
    }

    render() {
        return html`<label>${this.label}</label>
            <span> <input @input=${e => this._triggerInput(e)} type="checkbox" ?checked=${this.value} /> </span>`;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            input {
                height: 0.8rem;
                width: 0.8rem;
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 3px solid #eeeeee;
                outline: none;
            }

            input:focus {
                border: 1px solid cornflowerblue;
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

if (!customElements.get('devtools-checkbox')) {
    customElements.define('devtools-checkbox', DevtoolsCheckbox);
}
