import { css, html, LitElement } from "lit";
import { TriggerEventMessage, UpdateAttributeMessage, UpdatePropertyMessage } from "../../types/message-types.js";
import "./inputs/new-devtools-text-input.js";
import "./inputs/devtools-checkbox.js";
import "./devtools-event-item.js";
import "./devtools-method-item.js";
import "./inputs/devtools-object-input.js";
import "./inputs/devtools-combination-input.js";
import "./inputs/devtools-union-input.js";
import "./devtools-no-edit-property.js";
import {
    renderBooleanProperty,
    renderNoEditProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
    renderUndefinedProperty,
    renderUnionProperty,
} from "../../util/property-editor-builder.js";
import { DevToolsEventItem } from "./devtools-event-item.js";
import { determinePropertyType } from "../../util/property-typing.js";
import { CONNECTION_HOSTS, sendMessage } from "../../messaging/messaging.js";

export class DevToolsInspectorCategory extends LitElement {
    static get properties() {
        return {
            items: { type: Array },
            values: { type: Object },
            categoryTitle: { type: String },
            selectedElement: { type: Object },
            categoryType: { type: String },
            updateTimeout: { type: Number },
        };
    }

    constructor() {
        super();
        this.categoryTitle = "";
        this.items = [];
        this.values = {};
        /** @type import('../../types/devtools-element.js').DevToolsElement */
        this.selectedElement = null;
        this.categoryType = "attributes";
        this.updateTimeout = null;
    }

    firstUpdated() {
        if (this.categoryType === "events") {
            document.addEventListener(new TriggerEventMessage().type, (/** @type {CustomEvent} */ event) => {
                const eventData = event.detail.eventData;
                const targetEventItem = /** @type DevToolsEventItem */ (
                    this.shadowRoot.querySelector(`devtools-event-item[name='${eventData.event.name}']`)
                );
                if (targetEventItem) {
                    targetEventItem.trigger();
                }
            });
        }
    }

    updateAttributeOrPropertyValue(eventData) {
        const elementType = this.selectedElement.typeInDevTools;

        if (this.categoryType === "attributes") {
            sendMessage(
                CONNECTION_HOSTS.CONTENT,
                new UpdateAttributeMessage({
                    index: this.selectedElement.indexInDevTools,
                    value: eventData.value,
                    elementType,
                    attributeOrProperty: eventData.property,
                    propertyPath: eventData.propertyPath,
                }),
            );
        } else {
            sendMessage(
                CONNECTION_HOSTS.CONTENT,
                new UpdatePropertyMessage({
                    index: this.selectedElement.indexInDevTools,
                    value: eventData.value,
                    elementType,
                    attributeOrProperty: eventData.property,
                    propertyPath: eventData.propertyPath,
                }),
            );
        }

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            // TODO: Get the correct type of node here
            // sendMessage(CONNECTION_HOSTS.CONTENT, new SelectMessage({ node: this.selectedElement }));
        }, 200);
    }

    renderItem(item) {
        // Ignore our tooling props
        if (item.name.startsWith("__WC")) return "";

        switch (this.categoryType) {
            case "attributes":
                return this.renderProperty(item, true);
            case "properties":
                return this.renderProperty(item);
            case "events":
                return this.renderEvent(item);
            case "methods":
                return this.renderMethod(item);
        }
    }

    renderProperty(prop, isAttribute) {
        let propName = prop.name;
        let value = this.values ? this.values[prop.name] : "";
        const type = isAttribute ? "undefined" : determinePropertyType(prop, value);
        const inputOptions = {
            property: prop,
            propertyName: propName,
            value: value,
            inputCallback: this.updateAttributeOrPropertyValue.bind(this),
        };
        switch (type) {
            case "boolean":
                return renderBooleanProperty(inputOptions);
            case "number":
                return renderNumberProperty(inputOptions);
            case "array":
            case "object":
                return renderObjectProperty(inputOptions);
            case "undefined":
                return renderUndefinedProperty(inputOptions);
            case "union":
                return renderUnionProperty(inputOptions);
            case "no-edit":
                return renderNoEditProperty(inputOptions);
            default:
                return renderStringProperty(inputOptions);
        }
    }

    renderEvent(item) {
        return html` <li>
            <devtools-event-item .event=${item} name=${item.name} label=${item.name}></devtools-event-item>
        </li>`;
    }

    renderMethod(item) {
        return html`<li>
            <devtools-method-item .selectedElement=${this.selectedElement} .method=${item}></devtools-method-item>
        </li>`;
    }

    render() {
        return html`
            <details open>
                <summary>${this.categoryTitle}</summary>
                <ul>
                    ${this.items.map(item => this.renderItem(item))}
                </ul>
            </details>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                padding: 0.5rem 0 1rem 0.5rem;
                font-size: 0.8rem;
            }

            details {
                width: 100%;
                color: var(--paragraph-color);
            }

            summary {
                cursor: pointer;
                user-select: none;
            }

            ul,
            li {
                list-style: none;
            }

            li {
                padding: 0.2rem 0 0.2rem 1rem;
            }

            ul {
                padding: 0;
                margin: 0;
            }
        `;
    }
}

if (!customElements.get("devtools-inspector-category")) {
    customElements.define("devtools-inspector-category", DevToolsInspectorCategory);
}
