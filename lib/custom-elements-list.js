import { html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { sub } from "./util/messaging";
import { MESSAGE_TYPE } from "./types/message-types.js";

class CustomElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
        };
    }

    constructor() {
        super();
        this.customElementList = [];
    }

    firstUpdated() {
        sub((port, message) => {
            port.postMessage({ type: MESSAGE_TYPE.LOG, data: "Message recieved at list element and returned to log" });
        })
    }

    render() {
        return html`
            <p>Foobar</p>
      <ul>
        ${repeat(
            this.customElementList,
            (elem) => elem.name,
            (elem) => html` <li>${elem.name}</li> `
        )}
      </ul>
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
