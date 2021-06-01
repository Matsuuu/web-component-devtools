import { html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log, sub } from "./util/messaging";
import { MESSAGE_TYPE } from "./types/message-types.js";

const MESSAGING_CHANNEL = "CustomElementList";

class CustomElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            customElementMap: { type: Object }
        };
    }

    constructor() {
        super();
        this.customElementList = [];
    }

    firstUpdated() {
        sub(MESSAGING_CHANNEL, (_port, message) => {
            switch (message.type) {
                case MESSAGE_TYPE.INIT:
                    this._log("Init success");
                case MESSAGE_TYPE.QUERY_RESULT:
                    this._logObject("Messagedata: ", message.data);
                    if (message.data) {
                        this.customElementMap = message.data;
                        this.customElementList = Object.keys(this.customElementMap).map(key => this.customElementMap[key]);
                    }
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
            <p>Press query to query the elements on the page</p>
      <ul>
        ${repeat(
            this.customElementList,
            (elem) => elem.name,
            (elem) => html` <li>${elem.name}</li> `
        )}
      </ul>
      <button @click=${this._query}>Query</button>
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
