import { html, LitElement } from "lit-element";

export class ListIcon extends LitElement {
    render() {
        return html`
            <p>X</p>
        `;
    }
}

customElements.define("list-icon", ListIcon);
