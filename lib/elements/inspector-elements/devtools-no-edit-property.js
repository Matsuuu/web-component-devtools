import { css, html, LitElement } from 'lit';
import './indicators/devtools-property-indicators.js';

export class DevToolsNoEditProperty extends LitElement {
    static get properties() {
        return {
            value: { type: String, reflect: true },
            label: { type: String },
            property: { type: Object },
        };
    }

    constructor() {
        super();

        this.value = '';
        this.property = null;
        this.label = '';
        this.title = 'This value is not editable from the devtools';
    }

    render() {
        return html`${this.label.length > 0 ? html` <label>${this.label}:</label> ` : ''}
            <p>${this.value.replace("#NO_EDIT#", "")}</p>
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

            p {
                margin: 0;
                display: flex;
                padding-left: 0.5rem;
                align-items: center;
                font-size: 0.7rem;
                cursor: help;
                white-space: nowrap;
                overflow: hidden;
                color: var(--button-color);
            }

            label {
                font-size: 0.8rem;
                padding: 3px 0 3px 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
            }
        `;
    }
}

if (!customElements.get('devtools-no-edit-property')) {
    customElements.define('devtools-no-edit-property', DevToolsNoEditProperty);
}
