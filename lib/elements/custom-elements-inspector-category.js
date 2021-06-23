import { css, html, LitElement } from 'lit';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { postMessage } from '../util/messaging.js';
import './devtools-text-input.js';
import './devtools-checkbox.js';
import './devtools-event-item.js';
import './devtools-method-item.js';

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
        this.selectedElement = null;
        this.categoryType = 'attributes';
    }

    updatePropertyValue(prop, value) {
        console.log({ prop, value });
        const elementType = this.selectedElement.typeInDevTools;

        postMessage({
            type: MESSAGE_TYPE.UPDATE_PROPERTY,
            index: this.selectedElement.indexInDevTools,
            name: prop.name,
            value,
            elementType,
        });

        // Re-do Select to get the updated values
        // TODO(Matsuuu): Should there be a delay for this if there's for
        // example some other props that update in reaction
        postMessage({
            type: MESSAGE_TYPE.SELECT,
            index: this.selectedElement.indexInDevTools,
        });
    }

    renderItem(item) {
        console.log(this.categoryType);
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
                return this.renderBooleanProperty(prop, propName, value);
            case 'number':
                return this.renderNumberProperty(prop, propName, value);
            case 'object':
                return this.renderObjectProperty(prop, propName, value);
            default:
                return this.renderStringProperty(prop, propName, value);
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

    /**
     * @param {{value: any;name: String;}} prop
     * @param {String} propName
     * @param {any} value
     */
    renderObjectProperty(prop, propName, value) {
        return html`
            <li>${propName}</li>
            <li>
                <textarea @input=${e => this.updateJSONPropertyValue(prop, e.target.value)}>
${value ? JSON.stringify(value, null, 2) : ''}</textarea
                >
            </li>
        `;
    }

    /**
     * @param {{value: Number;name: String;}} prop
     * @param {String} propName
     * @param {any} value
     */
    renderNumberProperty(prop, propName, value) {
        return html`
            <li>
                <devtools-text-input
                    type="number"
                    label=${propName}
                    .value=${value ?? ''}
                    @devtools-input=${e => this.updatePropertyValue(prop, e.detail.value)}
                ></devtools-text-input>
            </li>
        `;
    }

    /**
     * @param {{value: String;name: String;}} prop
     * @param {String} propName
     * @param {any} value
     */
    renderStringProperty(prop, propName, value) {
        if (prop.value?.length > 100) {
            return html`
                <li>${propName}</li>
                <li>
                    <textarea @input=${e => this.updatePropertyValue(prop, e.target.value)}>${value ?? ''}</textarea>
                </li>
            `;
        } else {
            return html`
                <li>
                    <devtools-text-input
                        label=${propName}
                        .value=${this.values[prop.name] ?? ''}
                        @devtools-input=${e => this.updatePropertyValue(prop, e.detail.value)}
                    ></devtools-text-input>
                </li>
            `;
        }
    }

    /**
     * @param {{value: any;name: String;}} prop
     * @param {String} propName
     * @param {any} value
     */
    renderBooleanProperty(prop, propName, value) {
        return html`
            <li>
                <devtools-checkbox
                    label=${propName}
                    .value=${value ?? false}
                    @devtools-input=${e => this.updatePropertyValue(prop, e.detail.value)}
                ></devtools-checkbox>
            </li>
        `;
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
