import { css, html, LitElement } from 'lit';
import { log, postMessage } from '../util/messaging';
import { MESSAGE_TYPE } from '../types/message-types.js';
import './devtools-text-input.js';
import './devtools-checkbox.js';

const MESSAGING_CHANNEL = 'CustomElementsInspector';

export class CustomElementsInspector extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
            customElementsList: { type: Object },
            verticalView: { type: Boolean },
        };
    }

    constructor() {
        super();

        this.reload();
        this.customElementsList = null;
        this._initSubChannel();
        this.verticalView = true;

        const mediaQ = window.matchMedia('(max-width: 1000px)');
        mediaQ.addEventListener('change', mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });

        this.onResizeMouseMoveListener = this.onResizeMouseMove.bind(this);
    }

    reload() {
        /** @type DevToolsElement */
        this.selectedElement = null;
    }

    _initSubChannel() {
        document.addEventListener(MESSAGE_TYPE.REFRESH.toString(), this.reload.bind(this));
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            const message = event.detail;
            this.selectedElement = message.data;
        });
    }

    firstUpdated() {
        this.customElementsList = document.querySelector('custom-elements-list');
    }

    /**
     * @param {{ index: number; }} element
     */
    setSelectedElement(element) {
        if (this.selectedElement?.indexInDevTools !== element?.index) {
            postMessage({
                type: MESSAGE_TYPE.SELECT,
                index: element.index,
            });
        }
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

    updateJSONPropertyValue(key, valueAsString) {
        try {
            const value = JSON.parse(valueAsString);
        } catch (err) {
            //
        }
    }

    onResizeMouseMove(e) {
        if (this.verticalView) {
            const newFlexPercentage = (100 - (e.clientY / window.innerHeight) * 95).toFixed(0);
            this.style.setProperty('--inspector-size', newFlexPercentage + '%');
        } else {
            const newFlexPercentage = (100 - (e.clientX / window.innerWidth) * 95).toFixed(0);
            this.style.setProperty('--inspector-size', newFlexPercentage + '%');
        }
    }

    resizeStart() {
        document.addEventListener('mousemove', this.onResizeMouseMoveListener);
        const removeListener = () => {
            document.removeEventListener('mousemove', this.onResizeMouseMoveListener);
            document.removeEventListener('mouseup', removeListener);
        };
        document.addEventListener('mouseup', removeListener);
    }

    resizeEnd() {
        document.removeEventListener('mousemove', this.onResizeMouseMoveListener);
    }

    render() {
        return html`
            <div class="splitter" @mousedown=${this.resizeStart}><span></span><span class="header-block"></span></div>

            <div class="action-area">${this.showHeader()} ${this.showProperties()}</div>
        `;
    }

    showHeader() {
        return html`
            <header>
                <h2>${this.selectedElement?.__WC_DEV_TOOLS_ELEMENT_NAME ?? ''}</h2>
            </header>
        `;
    }

    showProperties() {
        if (!this.selectedElement) return '';

        console.log(this.selectedElement);
        return html`
            <ul>
                ${Object.keys(this.selectedElement.properties ?? {}).map(key =>
            this.renderProperty(this.selectedElement.properties[key]),
        )}
            </ul>
        `;
    }

    renderProperty(prop) {
        console.log(prop);
        let propName = prop.name.startsWith('__') ? prop.key.substring(2) : prop.name;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        switch (prop.type) {
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
     * @param {{ value: any; key: String; }} prop
     * @param {String} propName
     */
    renderObjectProperty(prop, propName) {
        return html`
            <li>${propName}</li>
            <li>
                <textarea @input=${e => this.updateJSONPropertyValue(prop.key, e.target.value)}>
${prop.value ? JSON.stringify(prop.value, null, 2) : ''}</textarea
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
            <li>
                <devtools-text-input
                    type="number"
                    label=${propName}
                    .value=${prop.value ?? ''}
                    @devtools-input=${e => this.updatePropertyValue(prop.key, e.detail.value)}
                ></devtools-text-input>
            </li>
        `;
    }

    /**
     * @param {{ value: String; key: String; }} prop
     * @param {String} propName
     */
    renderStringProperty(prop, propName) {
        if (prop.value?.length > 100) {
            return html`
                <li>${propName}</li>
                <li>
                    <textarea @input=${e => this.updatePropertyValue(prop.key, e.target.value)}>
${prop.value ?? ''}</textarea
                    >
                </li>
            `;
        } else {
            return html`
                <li>
                    <devtools-text-input
                        label=${propName}
                        .value=${prop.value ?? ''}
                        @devtools-input=${e => this.updatePropertyValue(prop.key, e.detail.value)}
                    ></devtools-text-input>
                </li>
            `;
        }
    }

    /**
     * @param {{ value: any; key: String }} prop
     * @param {String} propName
     */
    renderBooleanProperty(prop, propName) {
        return html`
            <li>
                <devtools-checkbox
                    label=${propName}
                    .value=${prop.value ?? false}
                    @devtools-input=${e => this.updatePropertyValue(prop.key, e.detail.value)}
                ></devtools-checkbox>
            </li>
        `;
    }

    static get styles() {
        return css`
            :host {
                --inspector-size: 40%;

                flex-basis: var(--inspector-size);
                display: flex;
                height: 100%;

                height: 100%;
                max-height: 100%;
                overflow-y: auto;
                box-sizing: border-box;
            }

            .action-area {
                width: 100%;
                display: flex;
                flex-direction: column;
                padding-bottom: 5rem;
            }

            header {
                border-bottom: 1px solid #eeeeee;
                display: flex;
                align-items: center;
                border-bottom: 2px solid #eeeeee;
                min-height: 56px;
                justify-content: space-between;
                box-sizing: border-box;
                background: #f2f2f2;
                padding: 0 1rem;
            }

            header h2 {
                font-size: 1.1rem;
                color: #333;
                margin-top: 0;
            }

            .splitter {
                width: 4px;
                height: 100%;
                padding: 0 1rem;
                display: flex;
                cursor: col-resize;
                position: relative;
            }

            .splitter > span {
                width: inherit;
                height: 100%;
                background: #eeeeee;
            }

            .splitter > .header-block {
                position: absolute;
                top: 0;
                left: 0;
                height: 56px;
                background: #f2f2f2;
                width: 100%;
            }

            ul,
            li {
                list-style: none;
            }

            li {
                padding: 1rem 0;
                border-bottom: 2px solid #eeeeee;
            }

            ul {
                padding: 0;
                margin: 0;
            }

            @media only screen and (max-width: 1000px) {
                :host {
                    flex-direction: column;
                    flex-basis: var(--inspector-size);
                }

                .splitter {
                    width: 100%;
                    height: 4px;
                    padding: 1rem 0;
                    cursor: row-resize;
                }

                .splitter > span {
                    width: 100%;
                    height: inherit;
                }

                .splitter > .header-block {
                    top: 20px;
                    height: 16px;
                }
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

if (!customElements.get('custom-elements-inspector')) {
    customElements.define('custom-elements-inspector', CustomElementsInspector);
}
