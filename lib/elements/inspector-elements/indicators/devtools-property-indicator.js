import { html, css, LitElement } from 'lit';
import { INHERITANCE, PRIVACY, STATIC } from '../../icons';

export class DevToolsPropertyIndicator extends LitElement {
    static get properties() {
        return {
            hovered: { type: Boolean, reflect: true },
            dir: { type: String, reflect: true },
            hovertext: { type: String, reflect: true },
            type: { type: String, reflect: true },
        };
    }

    constructor() {
        super();
        this.type = '';
        this.hovered = false;
        this.dir = 'right';
        this.hovertext = '';
    }

    firstUpdated() {
        this.addEventListener('mouseenter', () => (this.hovered = true));
        this.addEventListener('mouseleave', () => (this.hovered = false));
    }

    getIcon() {
        switch (this.type) {
            case 'static':
                return STATIC;
            case 'privacy':
                return PRIVACY;
            case 'inheritance':
                return INHERITANCE;
        }
    }

    render() {
        return html`${this.getIcon()}
            <span class="bubble">${this.hovertext}</span> `;
    }

    static get styles() {
        return css`
            :host {
                display: inline;
                width: 16px;
                height: 16px;
                position: relative;
                margin-left: auto;
                pointer-events: all;
            }

            svg {
                width: inherit;
                height: inherit;
                fill: var(--paragraph-color);
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
                z-index: 100;
            }

            :host([dir='right']) .bubble {
                left: 20px;
            }

            :host([dir='left']) .bubble {
                right: 20px;
            }

            :host([hovered][dir='right']) .bubble {
                top: 20px;
                left: 20px;
            }
            :host([hovered][dir='left']) .bubble {
                top: 20px;
                right: 20px;
            }
        `;
    }
}

if (!customElements.get('devtools-property-indicator')) {
    customElements.define('devtools-property-indicator', DevToolsPropertyIndicator);
}
