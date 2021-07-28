import { css, html, LitElement } from 'lit';

export class DevToolsRightClickMenuOption extends LitElement {
    static get properties() {
        return {
            label: { type: String, reflect: true }
        }
    }

    constructor() {
        super();
        this.label = "";
    }

    render() {
        return html`<label>${this.label}</label>`;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                color: #00214d;

                font-size: 0.8rem;
                padding: 0.25rem 1rem;
            }

            :host(:hover) {
                background: #e8e8e8;
            }
    `;
    }
}

if (!customElements.get('devtools-right-click-menu-option')) {
    customElements.define('devtools-right-click-menu-option', DevToolsRightClickMenuOption);
}
