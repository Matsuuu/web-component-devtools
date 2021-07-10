import { LitElement, html } from "lit";

export class ListItem extends LitElement {

    static get properties() {
        return {
            text: { type: String },
            index: { type: Number }
        };
    }

    constructor() {
        super();

        this.text = "";
        this.index = 0;
    }

    render() {
        return html`<p>${this.index}: ${this.text}</p>`;
    }
}
