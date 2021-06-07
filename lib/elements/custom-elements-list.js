import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log, subMessageChannel } from "../util/messaging";
import { MESSAGE_TYPE } from "../types/message-types.js";

const MESSAGING_CHANNEL = "CustomElementList";

class CustomElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            customElementMap: { type: Object },
            selectedElement: { type: Object },
            customElementsInspector: { type: Object },
        };
    }

    constructor() {
        super();
        this.customElementList = [];
        this.customElementMap = {};
        this.selectedElement = null;
        /** @type {CustomElementsInspector} */
        this.customElementsInspector = null;

        this._initSubChannel();
    }

    _initSubChannel() {
        subMessageChannel((_port, message) => {
            switch (message.type) {
                case MESSAGE_TYPE.INIT:
                    this._log("Init success");
                case MESSAGE_TYPE.QUERY_RESULT:
                    this._logObject("Query Result: ", message.data);
                    if (message.data) {
                        this.customElementMap = message.data.elementsMap;
                        this.customElementList = message.data.elementsArray;
                    }
                    break;
            }
        });
    }

    firstUpdated() {
        this.customElementsInspector = document.querySelector(
            "custom-elements-inspector"
        );
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
        postMessage({ type: MESSAGE_TYPE.QUERY });
    }

    /**
     * @param {{ index: any; }} elem
     */
    _spotlight(elem) {
        postMessage({
            type: MESSAGE_TYPE.HIGHLIGHT,
            index: elem.index,
        });
    }

    _spotlightOff() {
        postMessage({ type: MESSAGE_TYPE.HIGHLIGHT, index: -1 });
    }

    _select(elem) {
        this.customElementsInspector.setSelectedElement(elem);
    }

    render() {
        return html`
      <p>Press query to query the elements on the page</p>
      <ul>
        ${repeat(
            this.customElementList,
            (elem) => elem.name,
            (elem) => html`
            <li
              @mouseenter=${() => this._spotlight(elem)}
              @mouseleave=${this._spotlightOff}
              @click=${() => this._select(elem)}
            >
              ${elem.name}
            </li>
          `
        )}
      </ul>
      <button @click=${this._query}>Query</button>
    `;
    }

    static get styles() {
        return css`
      li {
        padding: 0.5rem;
        list-style: none;
        transition: 100ms ease-in-out;
      }

      li:hover {
        background: lightblue;
      }
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
