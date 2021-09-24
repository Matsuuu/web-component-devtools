import { css, html, LitElement } from 'lit';

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
        this.label = '';
        this.property = null;
        this.propertyPath = [];
    }

    updated(_changed) {
        // The input doesn't seem to update checked status by default
        if (_changed.has('checked')) {
            this.shadowRoot.querySelector('input').checked = this.checked;
        }
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.checked;

        this.dispatchEvent(
            new CustomEvent('devtools-input', {
                detail: { value, property: this.property, propertyPath: this.propertyPath },
                bubbles: true,
                composed: true,
            }),
        );
    }

    render() {
        return html`
            <label>${this.label}</label>
            <span><input @input=${e => this._triggerInput(e)} type="checkbox" ?checked=${this.checked} /></span>
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

            input {
                color: var(--button-color);
                height: 0.8rem;
                width: 0.8rem;
                border-radius: 4px;
                transition: 100ms ease-in-out;
                border: 3px solid #eeeeee;
                outline: none;
                margin-left: 1rem;
            }

            input:focus {
                border: 1px solid cornflowerblue;
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

if (!customElements.get('devtools-checkbox')) {
    customElements.define('devtools-checkbox', DevToolsCheckbox);
}
