import { css, html, LitElement } from "lit";
import { log, postMessage } from "../util/messaging";
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

        this.reload();
        this.customElementsList = null;
        this._initSubChannel();
    }

    reload() {
        this.selectedElement = null;
    }

    _initSubChannel() {
        document.addEventListener(
            MESSAGE_TYPE.REFRESH.toString(),
            this.reload.bind(this)
        );
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (
      /** @type {CustomEvent} */ event
        ) => {
            const message = event.detail;
            this.selectedElement = message.data;
            this._logObject("Select result: ", this.selectedElement);
        });
    }

    firstUpdated() {
        this.customElementsList = document.querySelector("custom-elements-list");
    }

    setSelectedElement(element) {
        this._logObject("Element", element);

        if (
            this.selectedElement?.__WC_DEV_TOOLS_SELECTED_INDEX !== element?.index
        ) {
            postMessage({
                type: MESSAGE_TYPE.SELECT,
                index: element.index,
            });
        }
    }

    updatePropertyValue(key, value) {
        this._logObject("Update property value: ", { key, value });

        postMessage({
            type: MESSAGE_TYPE.UPDATE_PROPERTY,
            index: this.selectedElement.__WC_DEV_TOOLS_SELECTED_INDEX,
            key,
            value
        });

    }

    updateJSONPropertyValue(key, valueAsString) {

        try {
            const value = JSON.parse(valueAsString);
            this._logObject("Update property value: ", { key, value });
        } catch (err) {
            //
        }
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
        ${Object.keys(this.selectedElement.properties).map((key) =>
            this.renderProperty(this.selectedElement.properties[key])
        )}
      </ul>
    `;
    }

    renderProperty(prop) {
        let propName = prop.key.startsWith("__") ? prop.key.substring(2) : prop.key;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        switch (prop.type) {
            case "Boolean":
                return this.renderBooleanProperty(prop, propName);
            case "Number":
                return this.renderNumberProperty(prop, propName);
            case "Object":
                return this.renderObjectProperty(prop, propName);
            default:
                return this.renderStringProperty(prop, propName);
        }
    }

    /**
     * @param {{ value: any; key: String; }} prop
     * @param {String} propName
     */
    renderObjectProperty(prop, propName) {
        return html`
      <li>${propName}</li>
      <li>
        <textarea @input=${(e) => this.updateJSONPropertyValue(prop.key, e.target.value)}>
${prop.value ? JSON.stringify(prop.value, null, 2) : ""}</textarea
        >
      </li>
    `;
    }

    /**
     * @param {{ value: Number; key: String }} prop
     * @param {String} propName
     */
    renderNumberProperty(prop, propName) {
        return html`
      <li>${propName}</li>
      <li><input @input=${(e) => this.updatePropertyValue(prop.key, e.target.value)} type="number" value=${prop.value ?? ""} /></li>
    `;
    }

    /**
     * @param {{ value: String; key: String; }} prop
     * @param {String} propName
     */
    renderStringProperty(prop, propName) {
        console.log(prop);
        if (prop.value?.length > 100) {
            return html`
        <li>${propName}</li>
        <li><textarea @input=${(e) => this.updatePropertyValue(prop.key, e.target.value)}>${prop.value ?? ""}</textarea></li>
      `;
        } else {
            return html`
        <li>${propName}</li>
        <li><input @input=${(e) => this.updatePropertyValue(prop.key, e.target.value)} type="text" value=${prop.value ?? ""} /></li>
      `;
        }
    }

    /**
     * @param {{ value: any; key: String }} prop
     * @param {String} propName
     */
    renderBooleanProperty(prop, propName) {
        return html`
      <li>${propName}</li>
      <li><input @input=${(e) => this.updatePropertyValue(prop.key, e.target.value)} type="checkbox" ?checked=${!!prop.value} /></li>
    `;
    }

    static get styles() {
        return css`
      :host {
        display: flex;
        height: 100%;
        border-left: 2px solid #000;
      }

      ul,
      li {
        list-style: none;
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
