import { html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log, sub } from "./util/messaging";
import { MESSAGE_TYPE } from "./types/message-types.js";

const MESSAGING_CHANNEL = "CustomElementList";

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
        sub(MESSAGING_CHANNEL, (_port, message) => {
            this._log(message);
            switch (message.type) {
                case MESSAGE_TYPE.INIT:
                    this._log("Init success");
                case MESSAGE_TYPE.QUERY_RESULT:
                    this._logObject("Query result successful", message);
            }
        })
    }

    /**
     * @param {any} message
     */
    _log(message) {
        log(MESSAGING_CHANNEL, message);
    }

    /**
     * @param {any} message
     * @param {any} object
     */
    _logObject(message, object) {
        log(MESSAGING_CHANNEL, message, object);
    }

    _query() {
        postMessage(MESSAGING_CHANNEL, { type: MESSAGE_TYPE.QUERY });
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
      <button @click=${() => this._log("Click")}>Click</button>
      <button @click=${this._query}>Query</button>
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
