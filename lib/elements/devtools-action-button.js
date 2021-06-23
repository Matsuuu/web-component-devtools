import { css, html, LitElement } from 'lit';

export class DevToolsActionButton extends LitElement {
    static get properties() {
        return {
            label: { type: String },
            primary: { type: Boolean, reflect: true },
            secondary: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();
        this.label = '';
        this.primary = false;
        this.secondary = false;
    }

    render() {
        return html`<button>${this.label}</button>`;
    }

    static get styles() {
        return css`
            button {
                --button-theme: var(--highlight);

                font-size: calc(var(--font-size) * 0.9);
                background: transparent;
                cursor: pointer;
                border: 1px solid var(--button-theme);
                height: fit-content;
            }

            :host {
                width: fit-content;
                display: inline;
            }

            :host([primary]) button {
                --button-theme: var(--highlight);
                color: var(--button-theme);
            }
            :host([secondary]) button {
                --button-theme: var(--secondary);
                color: var(--button-theme);
            }
        `;
    }
}

if (!customElements.get('devtools-action-button')) {
    customElements.define('devtools-action-button', DevToolsActionButton);
}
