import { html, LitElement } from "lit-element";

export class ListItem extends LitElement {
    render() {
        return html`
            <p><slot></slot></p>
            <list-icon></list-icon>
            <list-icon></list-icon>
            <list-icon></list-icon>
        `;
    }
}

customElements.define("list-item", ListItem);
