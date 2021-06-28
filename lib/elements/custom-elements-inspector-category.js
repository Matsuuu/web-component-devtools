import { css, html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { postMessage } from '../util/messaging.js';
import './devtools-text-input.js';
import './devtools-checkbox.js';
import './devtools-event-item.js';
import './devtools-method-item.js';
import './devtools-object-input.js';
import {
    renderBooleanProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
} from '../util/property-editor-builder.js';

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
            propertyPath: eventData.propertyPath
        });

        // Re-do Select to get the updated values
        // TODO(Matsuuu): Should there be a delay for this if there's for
        // example some other props that update in reaction
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
        const value = this.values ? this.values[prop.name] ?? '' : '';
        const type = prop?.type?.text ?? 'string';
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
            <devtools-event-item label=${item.name}></devtools-event-item>
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
