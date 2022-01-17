import { html, css, LitElement } from 'lit';
import { INHERITANCE } from './icons';

export class DevToolsInheritanceIndicator extends LitElement {

    static get properties() {
        return {
            parentClass: { type: String, reflect: true },
            hovered: { type: Boolean, reflect: true },
            extends: { type: Boolean, reflect: true },
            dir: { type: String, reflect: true }
        }
    }

    constructor() {
        super();
        this.parentClass = "";
        this.hovered = false;
        this.extends = false;
        this.dir = "up";
    }

    firstUpdated() {
        this.addEventListener("mouseenter", () => this.hovered = true);
        this.addEventListener("mouseleave", () => this.hovered = false);
    }

    render() {
        return html`${INHERITANCE}

            <span class="bubble">
                ${this.extends ? 'Extends' : 'Inherited from'} ${this.parentClass}
            </span>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
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
                right: 10px;
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

            :host([hovered][dir='up']) .bubble {
                top: -20px;
            }

            :host([hovered][dir='down']) .bubble {
                top: 20px;
            }
        `;
    }
}

if (!customElements.get('devtools-inheritance-indicator')) {
    customElements.define('devtools-inheritance-indicator', DevToolsInheritanceIndicator);
}
