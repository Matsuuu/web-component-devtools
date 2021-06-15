import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log } from "../util/messaging";
import { MESSAGE_TYPE } from "../types/message-types.js";
import { CustomElementsInspector } from "./custom-elements-inspector";
import { REFRESH_ICON } from "./icons";

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
        /** @type {CustomElementsInspector} */
        this.customElementsInspector = null;
        this.reload();
        this._initSubChannel();
    }

    reload() {
        /** @type {Array<any>} */
        this.customElementList = [];
        this.customElementMap = {};
        this.selectedElement = null;
    }

    _initSubChannel() {
        document.addEventListener(
            MESSAGE_TYPE.REFRESH.toString(),
            this.reload.bind(this)
        );
        document.addEventListener(MESSAGE_TYPE.INIT.toString(), () => { });
        document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (
      /** @type {CustomEvent} */ event
        ) => {
            const message = event.detail;

            this._logObject("Query Result: ", message.data);
            if (message.data) {
                this.customElementMap = message.data.elementsMap;
                this.customElementList = message.data.elementsArray;
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
        this.selectedElement = elem;
    }

    _getChildElementsInTree(elem) {
        const elementsBelow = this.customElementList.slice(elem.index + 1);

        let childCount = 0;
        while (true) {
            const el = elementsBelow.shift();
            if (
                el.__LIT_DEV_TOOLS_ELEMENT_DEPTH <= elem.__LIT_DEV_TOOLS_ELEMENT_DEPTH
            )
                break;
            childCount++;
        }

        const listElements = Array.from(this.shadowRoot.querySelectorAll("li"));
        const children = listElements.slice(
            elem.index,
            elem.index + childCount + 1
        );

        return children;
    }

    render() {
        return html`
      <ul>
        ${this.renderElements()}
      </ul>
      <button @click=${this._query} class="refresh-button">
        ${REFRESH_ICON}
      </button>
    `;
    }

    renderElements() {
        return html`
      ${repeat(
            this.customElementList,
            (elem) => elem.name,
            (elem) => html`
          <li
            ?selected-element=${this.selectedElement?.index === elem.index}
            style="padding-left: ${elem.__LIT_DEV_TOOLS_ELEMENT_DEPTH}rem"
            @mouseenter=${() => this._spotlight(elem)}
            @mouseleave=${this._spotlightOff}
            @click=${() => this._select(elem)}
          >
            ${elem.name}
          </li>
        `
        )}
    `;
    }

    static get styles() {
        return css`
      :host {
        flex: 1 20 auto;
        position: relative;
        height: 100%;
        max-height: 100%;
        overflow-y: auto;
      }

      ul {
        margin-top: 2rem;
        padding: 0 1rem;
      }

      li {
        padding: 0.1rem;
        list-style: none;
        transition: 100ms ease-in-out;
        cursor: pointer;
        color: #451db7;
        user-select: none;
      }

      li:hover {
        background: #d8e9ef;
      }

      li[selected-element] {
        background: #b7e1ef;
      }

      .refresh-button {
        position: absolute;
        top: 0;
        right: 0.4rem;
        background: none;
        border: none;
        cursor: pointer;
        transition: 400ms ease-in-out;
        transform: rotate(0);
      }

      .refresh-button:hover {
        transform: rotate(-150deg);
      }
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
