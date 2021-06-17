import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat";
import { postMessage, log } from "../util/messaging";
import { MESSAGE_TYPE } from "../types/message-types.js";
import { CustomElementsInspector } from "./custom-elements-inspector";
import { REFRESH_ICON } from "./icons";
import "./custom-elements-list-item.js";
import "./devtools-text-input.js";

const MESSAGING_CHANNEL = "CustomElementList";

class CustomElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            shownCustomElements: { type: Array },
            currentFilter: { type: Object },
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
        this.shownCustomElements = [];
        this.currentFilter = {};
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
                this._updateCurrentShownCustomElements();
            }
        });
    }

    _updateCurrentShownCustomElements() {
        this.shownCustomElements = this.customElementList.filter((elem) => {
            const nameFilterString = this.currentFilter?.nameFilter;
            if (!nameFilterString) return true;

            const regx = new RegExp(nameFilterString);
            return regx.test(elem.name);
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

    _onWordFilterInput(e) {
        const val = e.detail.value;
        this.currentFilter.nameFilter = val;
        this._updateCurrentShownCustomElements();
    }

    render() {
        return html`
      <header>
          <devtools-text-input @devtools-input=${this._onWordFilterInput} placeholder="Filter by name"></devtools-text-input>

        <button @click=${this._query} class="refresh-button">
          ${REFRESH_ICON}
        </button>
      </header>
      <ul>
        ${this.renderElements()}
      </ul>
    `;
    }

    renderElements() {
        return html`
      ${repeat(
            this.shownCustomElements,
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
        padding: 0 1rem;
      }

      header {
        display: flex;
        align-items: center;
        border-bottom: 2px solid #eeeeee;
        height: 56px;
        justify-content: space-between;
        box-sizing: border-box;
        background: #fafafa;
        padding: 0 1rem;
      }

      .refresh-button {
        background: none;
        border: none;
        cursor: pointer;
        transition: 400ms ease-in-out;
        transform: rotate(0);
        margin-right: 1rem;
      }

      .refresh-button:hover {
        transform: rotate(-150deg);
      }
    `;
    }
}

customElements.define("custom-elements-list", CustomElementList);
