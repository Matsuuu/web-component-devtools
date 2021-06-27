import { css, html, LitElement } from 'lit';

export class DevToolsEventItem extends LitElement {
    static get properties() {
        return {
            name: { type: String },
            label: { type: String },
        };
    }

    constructor() {
        super();

        this.name = '';
        this.label = '';
    }

    render() {
        return html`${this.label.length > 0 ? html`<label>${this.label}:</label>` : ''}`;
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
                padding: 3px 1rem 3px 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
            }
        `;
    }
}

if (!customElements.get('devtools-event-item')) {
    customElements.define('devtools-event-item', DevToolsEventItem);
}
