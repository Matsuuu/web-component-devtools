import { css, html, LitElement } from 'lit-element';

export class FancyTitle extends LitElement {
    static get properties() {
        return {
            color: { type: String },
        };
    }

    render() {
        return html` <h2 style="color: ${this.color ?? 'red'}"><slot></slot></h2> `;
    }
}

customElements.define('fancy-title', FancyTitle);
