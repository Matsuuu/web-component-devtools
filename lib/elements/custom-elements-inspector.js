import { css, html, LitElement } from "lit-element";
import { log, sub, postMessage } from "../util/messaging";
import { MESSAGE_TYPE } from "../types/message-types.js";

const MESSAGING_CHANNEL = "CustomElementsInspector";

export class CustomElementsInspector extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
            customElementsList: { type: Object },
        };
    }

    constructor() {
        super();

        this.selectedElement = null;
        this.customElementsList = null;
    }

    firstUpdated() {
        this.customElementsList = document.querySelector("custom-elements-list");
        sub(MESSAGING_CHANNEL, (_port, message) => {
            switch (message.type) {
                case MESSAGE_TYPE.SELECT_RESULT:
                    this._logObject("Select result: ", message.data);
                    break;
            }
        });
    }

    setSelectedElement(element) {
        this.selectedElement = element;
        this._logObject("Element", this.selectedElement);

        postMessage(MESSAGING_CHANNEL, {
            type: MESSAGE_TYPE.SELECT,
            index: element.index,
        });
    }

    render() {
        return html`<p>Inspector pane</p>

      ${this.showProperties()} `;
    }

    showProperties() {
        if (!this.selectedElement) return html``;

        this.selectedElement;
        return html`
      <ul>
        ${this.selectedElement.properties.map((prop) =>
            this.renderProperty(prop)
        )}
      </ul>
    `;
    }

    renderProperty(prop) {
        const propName = prop.startsWith("__") ? prop.substring(2) : prop;
        return html` <li>${propName}</li> `;
    }

    static get styles() {
        return css`
      :host {
        display: flex;
        height: 100%;
        border-left: 2px solid #000;
      }
    `;
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
}

if (!customElements.get("custom-elements-inspector")) {
    customElements.define("custom-elements-inspector", CustomElementsInspector);
}
