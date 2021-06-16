import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log } from "../util/messaging";
import { MESSAGE_TYPE } from "../types/message-types.js";
import { CustomElementsInspector } from "./custom-elements-inspector";
import { REFRESH_ICON } from "./icons";
import "../elements/custom-elements-list-item.js";

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
     * @param {CustomEvent} event
     */
    _onElementSelect(event) {
        const elem = event.detail;
        this.customElementsInspector.setSelectedElement(elem);
        this.selectedElement = elem;
    }

    /**
     * @param {number} index
     */
    _getElementInTreeByIndex(index) {
        const elems = this.shadowRoot.querySelectorAll("custom-elements-list-item");
        return elems[index];
    }

    /**
     * @param {any} elem
     */
    _getChildElementsInTree(elem) {
        const childElementRange = this._getChildElementRange(elem);
        const listElements = Array.from(
            this.shadowRoot.querySelectorAll("custom-elements-list-item")
        );
        const children = listElements.slice(
            childElementRange[0],
            childElementRange[1]
        );

        return children;
    }

    /**
     * @param {{ index: number; __WC_DEV_TOOLS_ELEMENT_DEPTH: number; }} elem
     */
    _getChildElementRange(elem) {
        const elementsBelow = this.customElementList.slice(elem.index + 1);

        let childCount = 0;
        while (elementsBelow.length > 0) {
            const el = elementsBelow.shift();
            if (el.__WC_DEV_TOOLS_ELEMENT_DEPTH <= elem.__WC_DEV_TOOLS_ELEMENT_DEPTH)
                break;
            childCount++;
        }

        return [elem.index + 1, elem.index + childCount + 1];
    }

    /**
     * @param {any} elem
     */
    _hasChildren(elem) {
        const childElementRange = this._getChildElementRange(elem);
        return childElementRange[0] < childElementRange[1];
    }

    /**
     * @param {CustomEvent} event
     * */
    _toggleChildren(event) {
        const elem = event.detail;
        const children = this._getChildElementsInTree(elem);
        children.forEach((child) => child.toggleAttribute("hidden"));
        this._getElementInTreeByIndex(elem.index).toggleAttribute(
            "children-hidden"
        );
    }

    /**
     * @param {string} moveDirection
     */
    _moveFocus(moveDirection) {
        /** @type { HTMLElement } */
        let target;
        if (moveDirection === "down") {
            target = /** @type HTMLElement */ (this.shadowRoot.activeElement
                .nextElementSibling);
        } else {
            target = /** @type HTMLElement */ (this.shadowRoot.activeElement
                .previousElementSibling);
        }
        target.focus();
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
          <custom-elements-list-item
            .element=${elem}
            ?selected=${this.selectedElement?.index === elem.index}
            ?hasChildren=${this._hasChildren(elem)}
            @list-item-selected=${this._onElementSelect}
            @list-item-children-toggle=${this._toggleChildren}
            @list-item-focus-next=${() => this._moveFocus("down")}
            @list-item-focus-previous=${() => this._moveFocus("up")}
          >
          </custom-elements-list-item>
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
