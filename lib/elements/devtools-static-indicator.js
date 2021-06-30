import { html, css, LitElement } from 'lit';
import { STATIC } from './icons';

export class DevToolsStaticIndicator extends LitElement {
    static get properties() {
        return {
            hovered: { type: Boolean, reflect: true },
            type: { type: String, reflect: true },
            dir: { type: String, reflect: true },
        };
    }

    constructor() {
        super();
        this.hovered = false;
        this.type = 'variable';
        this.dir = 'right';
    }

    firstUpdated() {
        this.addEventListener('mouseenter', () => (this.hovered = true));
        this.addEventListener('mouseleave', () => (this.hovered = false));
    }

    render() {
        return html`${STATIC}

            <span class="bubble"> Static ${this.type} </span> `;
    }

    static get styles() {
        return css`
            :host {
                display: inline;
                width: 16px;
                height: 16px;
                position: relative;
                margin-left: auto;
            }

            svg {
                width: inherit;
                height: inherit;
            }

            .bubble {
                opacity: 0;
                position: absolute;
                top: 0;
                padding: 0.2rem;
                border-radius: 2px;
                background: var(--paragraph-color);
                color: var(--background-color);
                white-space: nowrap;
                width: fit-content;
                transition: 300ms ease-in-out;
                pointer-events: none;
            }

            :host([hovered]) .bubble {
                opacity: 1;
            }

            :host([dir='right']) .bubble {
                left: 20px;
            }

            :host([hovered][dir='right']) .bubble {
                top: 20px;
                left: 20px;
            }
        `;
    }
}

if (!customElements.get('devtools-static-indicator')) {
    customElements.define('devtools-static-indicator', DevToolsStaticIndicator);
}
