import { css, html } from "lit";
import { LitElement } from "lit-element";

class CustomElementsListNameFilter extends LitElement {

    render() {
        return html``;
    }

    static get styles() {
        return css``;
    }
}

if (!customElements.get("custom-elements-list-name-filter")) {
    customElements.define("custom-elements-list-name-filter", CustomElementsListNameFilter);
}
