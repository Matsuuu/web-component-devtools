import { css, html, LitElement } from 'lit';
import {
    renderBooleanProperty,
    renderNoEditProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
    renderUnionProperty,
} from '../../../util/property-editor-builder.js';
import { determinePropertyType } from '../../../util/property-typing.js';
import '../indicators/devtools-property-indicators.js';

export class DevtoolsObjectInput extends LitElement {
    static get properties() {
        return {
            object: { type: Object },
            property: { type: Object },
            propName: { type: String },
            objectPropertyTemplate: { type: Object },
            propertyPath: { type: Array },
            hasBeenOpened: { type: Boolean },
        };
    }

    constructor() {
        super();
        this.object = {};
        this.property = {};
        this.propName = '';
        this.objectPropertyTemplate = html``;
        this.propertyPath = [];
        this.hasBeenOpened = false;
    }

    updated(_changedProperties) {
        if (this.hasBeenOpened && _changedProperties.has('object')) {
            this.objectPropertyTemplate = this.getObjectProperties();
        }
    }

    _onToggle(e) {
        if (e.target.open) {
            this.objectPropertyTemplate = this.getObjectProperties();
            this.hasBeenOpened = true;
        }
    }

    _getObjectPreview() {
        let objectPreview = JSON.stringify(this.object);
        objectPreview = objectPreview.replace("#NO_EDIT#", "");
        if (objectPreview && objectPreview.length > 40) objectPreview = objectPreview.substring(0, 40) + '...';
        return objectPreview;
    }

    render() {
        return html`
            <details @toggle=${this._onToggle}>
                <summary>
                    <span>
                        <label>${this.propName}:</label>
                        <label class="preview">${this._getObjectPreview()}</label></span
                    >
                    <devtools-property-indicators .property=${this.property}></devtools-property-indicator>
                </summary>
                ${this.objectPropertyTemplate}
            </details>
        `;
    }

    getObjectProperties() {
        if (typeof this.object === 'object' && Object.keys(this.object).length <= 0) {
            return html`<label class="no-length-indicator">${Array.isArray(this.object) ? '[]' : '{}'}</label>`;
        }
        return html` ${Object.keys(this.object).map(key => this.renderProperty({ name: key }))}`;
    }

    renderProperty(prop) {
        // Ignore our tooling props
        if (prop.name.startsWith("__WC")) return '';

        let propName = prop.name;
        const value = this.object ? this.object[prop.name] ?? '' : '';
        const type = determinePropertyType(prop, value);
        prop.type = { text: type };
        const inputOptions = {
            property: prop,
            propertyName: propName,
            value: value,
            propertyPath: [...this.propertyPath, this.property.name],
        };
        switch (type) {
            case 'boolean':
                return renderBooleanProperty(inputOptions);
            case 'number':
                return renderNumberProperty(inputOptions);
            // @ts-ignore
            case 'array':
            case 'object':
                return renderObjectProperty(inputOptions);
            case 'union':
                return renderUnionProperty(inputOptions);
            case 'no-edit':
                return renderNoEditProperty(inputOptions);
            default:
                return renderStringProperty(inputOptions);
        }
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            summary {
                margin-left: -1.6rem;
                width: calc(100% + 1.6rem);
                cursor: pointer;
                user-select: none;
            }
            summary > span {
                display: inline;
                width: 100%;
                box-sizing: border-box;
                pointer-events: none;
            }

            details {
                display: flex;
                width: 100%;
                padding-left: 0.8rem;
            }

            details[open] {
                padding-bottom: 1rem;
            }

            .param-function-caller {
                margin: 0 0 0 1rem;
            }

            label {
                font-size: 0.8rem;
                padding: 0 0 0 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
                vertical-align: middle;
            }

            .preview {
                padding-left: 1rem;
                font-size: 0.65rem;
                color: var(--highlight);
            }

            .no-length-indicator {
                color: var(--highlight);
            }

            .param-list {
                display: flex;
                flex-direction: column;
                padding: 0 0 0 1rem;
            }
        `;
    }
}

if (!customElements.get('devtools-object-input')) {
    customElements.define('devtools-object-input', DevtoolsObjectInput);
}
