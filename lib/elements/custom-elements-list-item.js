import { css, html, LitElement } from "lit";
import { postMessage } from "../util/messaging.js";
import { MESSAGE_TYPE } from "../types/message-types.js";
import { ARROW_UP } from "./icons.js";

export class CustomElementsListItem extends LitElement {
    static get properties() {
        return {
            element: { type: Object },
            selected: { type: Boolean, reflect: true },
            hasChildren: { type: Boolean, reflect: true }
        };
    }

    constructor() {
        super();
        this.element = null;
        this.selected = false;
        this.hasChildren = false;
    }

    firstUpdated() {
        this.addEventListener("mouseenter", this._spotlight);
        this.addEventListener("mouseleave", this._spotlightOff);
        this.addEventListener("click", this._select);
    }

    _spotlight() {
        postMessage({
            type: MESSAGE_TYPE.HIGHLIGHT,
            index: this.element.index,
        });
    }

    _spotlightOff() {
        postMessage({ type: MESSAGE_TYPE.HIGHLIGHT, index: -1 });
    }

    _select() {
        const selectEvent = new CustomEvent("list-item-selected", {
            detail: this.element,
        });
        this.dispatchEvent(selectEvent);
    }

    _toggleChildren() {
        const toggleEvent = new CustomEvent("list-item-children-toggle", {
            detail: this.element,
        });
        this.dispatchEvent(toggleEvent);
    }

    render() {
        return html`
      <li
        ?selected-element=${this.selected}
        style="padding-left: ${this.element.__LIT_DEV_TOOLS_ELEMENT_DEPTH}rem"
      >
        ${this.hasChildren
                ? html`
              <span class="child-toggler" @click=${this._toggleChildren}
                >${ARROW_UP}</span
              >
            `
                : ""}
        <span>${this.element.name}</span>
      </li>
    `;
    }

    static get styles() {
        return css`
      :host {
        display: list-item;
        padding: 0.1rem;
        list-style: none;
        transition: 100ms ease-in-out;
        cursor: pointer;
        color: #451db7;
        user-select: none;
      }

      :host([hidden]) {
        display: none;
      }

      .child-toggler svg {
        transition: 100ms ease-in-out;
        transform: rotate(180deg);
        height: 0.6rem;
        width: 0.6rem;
      }

      :host([children-hidden]) .child-toggler svg {
        transform: rotate(90deg);
      }

      :host(:hover) {
        background: #d8e9ef;
      }

      :host([selected-element]) {
        background: #b7e1ef;
      }
    `;
    }
}

if (!customElements.get("custom-elements-list-item")) {
    customElements.define("custom-elements-list-item", CustomElementsListItem);
}
