import { css, html, LitElement } from 'lit';

export class DevToolsEventItem extends LitElement {
    static get properties() {
        return {
            name: { type: String, reflect: true },
            label: { type: String },
            triggered: { type: Boolean, reflect: true },
            event: { type: Object },
        };
    }

    constructor() {
        super();

        this.name = '';
        this.label = '';
        this.triggered = false;
        this.event = null;
    }

    trigger() {
        this.triggered = true;
        setTimeout(() => {
            this.triggered = false;
        }, 50);
    }

    render() {
        return html`${this.label.length > 0 ? html`<label>${this.label}:</label>` : ''}
        ${this.event.inheritedFrom
                ? html` <devtools-property-indicators .property=${this.event}></devtools-property-indicators> `
                : ''} `;
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            label {
                font-size: 0.8rem;
                padding: 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;

                background: transparent;
                transition: 1000ms ease-in-out;
            }

            :host([triggered]) label {
                transition: 0ms ease-in-out;
                background: var(--highlight);
                color: var(--background-color);
            }
        `;
    }
}

if (!customElements.get('devtools-event-item')) {
    customElements.define('devtools-event-item', DevToolsEventItem);
}
