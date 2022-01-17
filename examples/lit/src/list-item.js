import { html, css, LitElement } from 'lit-element';

export class ListItem extends LitElement {
    static get properties() {
        return {
            selected: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();
        this.selected = false;
    }

    render() {
        return html` <p><slot></slot></p> `;
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }

            :host([selected]) {
                background: rgba(0, 0, 200, 0.4);
            }
        `;
    }
}

customElements.define('list-item', ListItem);
