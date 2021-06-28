import { css, html, LitElement } from 'lit';
import {
    renderBooleanProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
} from '../util/property-editor-builder';

export class DevtoolsObjectInput extends LitElement {
    static get properties() {
        return {
            object: { type: Object },
            property: { type: Object },
            propName: { type: String },
            objectPropertyTemplate: { type: Object },
        };
    }

    constructor() {
        super();
        this.object = {};
        this.property = {};
        this.propName = '';
        this.objectPropertyTemplate = html``;
    }

    _onToggle(e) {
        if (e.target.open) {
            this.objectPropertyTemplate = this.getObjectProperties();
        }
    }

    render() {
        return html`
            <details @toggle=${this._onToggle}>
                <summary>
                    <span><label>${this.propName}:</label></span>
                </summary>
                ${this.objectPropertyTemplate}
            </details>
        `;
    }

    getObjectProperties() {
        return html` ${Object.keys(this.object).map(key => this.renderProperty({ name: key }))}`;
    }

    renderProperty(prop) {
        let propName = prop.name.startsWith('__') ? prop.name.substring(2) : prop.name;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        const value = this.object ? this.object[prop.name] ?? '' : '';
        const type = typeof value ?? 'string';
        prop.type = { text: type };
        switch (type) {
            case 'boolean':
                return renderBooleanProperty(prop, propName, value);
            case 'number':
                return renderNumberProperty(prop, propName, value);
            // @ts-ignore
            case 'array':
            case 'object':
                return renderObjectProperty(prop, propName, value);
            default:
                return renderStringProperty(prop, propName, value);
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
                margin-left: -0.85rem;
                width: 100%;
            }

            summary > span {
                display: inline;
                width: 100%;
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
                padding: 3px 1rem 3px 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
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
