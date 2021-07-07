import { css, html, LitElement } from 'lit';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { postMessage } from '../util/messaging.js';
import './devtools-text-input.js';
import './devtools-checkbox.js';
import './devtools-event-item.js';
import './devtools-method-item.js';
import './devtools-object-input.js';
import './devtools-combination-input.js';
import {
    renderBooleanProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
    renderUndefinedProperty,
} from '../util/property-editor-builder.js';
import { DevToolsEventItem } from './devtools-event-item.js';
import { determinePropertyType } from '../util/property-typing.js';

export class CustomElementsInspectorCategory extends LitElement {
    static get properties() {
        return {
            items: { type: Array },
            values: { type: Object },
            title: { type: String },
            selectedElement: { type: Object },
            categoryType: { type: String },
        };
    }

    constructor() {
        super();
        this.title = '';
        this.items = [];
        this.values = {};
        /** @type DevToolsElement */
        this.selectedElement = null;
        this.categoryType = 'attributes';
    }

    firstUpdated() {
        if (this.categoryType === 'events') {
            document.addEventListener(MESSAGE_TYPE.TRIGGER_EVENT.toString(), (/** @type {CustomEvent} */ event) => {
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

        const eventType =
            this.categoryType === 'attributes' ? MESSAGE_TYPE.UPDATE_ATTRIBUTE : MESSAGE_TYPE.UPDATE_PROPERTY;

        postMessage({
            type: eventType,
            index: this.selectedElement.indexInDevTools,
            value: eventData.value,
            elementType,
            attributeOrProperty: eventData.property,
            propertyPath: eventData.propertyPath,
        });

        postMessage({
            type: MESSAGE_TYPE.SELECT,
            indexInDevTools: this.selectedElement.indexInDevTools,
            name: this.selectedElement.name,
            tagName: this.selectedElement.tagName,
        });
    }

    renderItem(item) {
        switch (this.categoryType) {
            case 'attributes':
            case 'properties':
                return this.renderProperty(item);
            case 'events':
                return this.renderEvent(item);
            case 'methods':
                return this.renderMethod(item);
        }
    }

    renderProperty(prop) {
        let propName = prop.name.startsWith('__') ? prop.name.substring(2) : prop.name;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        let value = this.values ? this.values[prop.name] : '';
        const type = determinePropertyType(prop, value);
        switch (type) {
            case 'boolean':
                return renderBooleanProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    inputCallback: this.updateAttributeOrPropertyValue.bind(this),
                });
            case 'number':
                return renderNumberProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    inputCallback: this.updateAttributeOrPropertyValue.bind(this),
                });
            case 'array':
            case 'object':
                return renderObjectProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    inputCallback: this.updateAttributeOrPropertyValue.bind(this),
                });
            case 'undefined':
                return renderUndefinedProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    inputCallback: this.updateAttributeOrPropertyValue.bind(this),
                });
            default:
                return renderStringProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    inputCallback: this.updateAttributeOrPropertyValue.bind(this),
                });
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
                <summary>${this.title}</summary>
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
                padding: 0 0 0 1rem;
            }

            ul {
                padding: 0;
                margin: 0;
            }
        `;
    }
}

if (!customElements.get('custom-elements-inspector-category')) {
    customElements.define('custom-elements-inspector-category', CustomElementsInspectorCategory);
}
