import { css, html, LitElement } from 'lit';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { postMessage } from '../util/messaging.js';

export class CustomElementsInspectorCategory extends LitElement {
    static get properties() {
        return {
            items: { type: Array },
            values: { type: Object },
            title: { type: String },
        };
    }

    constructor() {
        super();
        this.title = '';
        this.items = [];
        this.values = {};
    }

    updatePropertyValue(key, value) {
        const elementType = this.selectedElement.typeInDevTools;

        postMessage({
            type: MESSAGE_TYPE.UPDATE_PROPERTY,
            index: this.selectedElement.indexInDevTools,
            key,
            value,
            elementType,
        });
    }

    renderProperty(prop) {
        console.log(prop);
        let propName = prop.name.startsWith('__') ? prop.name.substring(2) : prop.name;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        switch (prop.type.text) {
            case 'boolean':
                return this.renderBooleanProperty(prop, propName);
            case 'number':
                return this.renderNumberProperty(prop, propName);
            case 'object':
                return this.renderObjectProperty(prop, propName);
            default:
                return this.renderStringProperty(prop, propName);
        }
    }

    /**
     * @param {{ value: any; name: String; }} prop
     * @param {String} propName
     */
    renderObjectProperty(prop, propName) {
        return html`
            <li>${propName}</li>
            <li>
                <textarea @input=${e => this.updateJSONPropertyValue(prop.name, e.target.value)}>
${this.values[prop.name] ? JSON.stringify(this.values[propName], null, 2) : ''}</textarea
                >
            </li>
        `;
    }

    /**
     * @param {{ value: Number; name: String }} prop
     * @param {String} propName
     */
    renderNumberProperty(prop, propName) {
        return html`
            <li>
                <devtools-text-input
                    type="number"
                    label=${propName}
                    .value=${this.values[prop.name] ?? ''}
                    @devtools-input=${e => this.updatePropertyValue(prop.name, e.detail.value)}
                ></devtools-text-input>
            </li>
        `;
    }

    /**
     * @param {{ value: String; name: String; }} prop
     * @param {String} propName
     */
    renderStringProperty(prop, propName) {
        if (prop.value?.length > 100) {
            return html`
                <li>${propName}</li>
                <li>
                    <textarea @input=${e => this.updatePropertyValue(prop.name, e.target.value)}>
${this.values[prop.name] ?? ''}</textarea
                    >
                </li>
            `;
        } else {
            return html`
                <li>
                    <devtools-text-input
                        label=${propName}
                        .value=${this.values[prop.name] ?? ''}
                        @devtools-input=${e => this.updatePropertyValue(prop.name, e.detail.value)}
                    ></devtools-text-input>
                </li>
            `;
        }
    }

    /**
     * @param {{ value: any; name: String }} prop
     * @param {String} propName
     */
    renderBooleanProperty(prop, propName) {
        return html`
            <li>
                <devtools-checkbox
                    label=${propName}
                    .value=${this.values[prop.name] ?? false}
                    @devtools-input=${e => this.updatePropertyValue(prop.name, e.detail.value)}
                ></devtools-checkbox>
            </li>
        `;
    }

    render() {
        return html`
            <details open>
                <summary>${this.title}</summary>
                <ul>
                    ${this.items.map(item => this.renderProperty(item))}
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
