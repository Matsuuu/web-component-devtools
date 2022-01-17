import { html, LitElement } from "lit-element";

export class ListWrapper extends LitElement {

    render() {
        return html`
            <div>
                <slot name="header"></slot>
                <slot></slot>
            </div>
        `;
    }
}

customElements.define("list-wrapper", ListWrapper);
