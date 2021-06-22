import { css, html, LitElement } from 'lit';
import { log, postMessage } from '../util/messaging';
import { MESSAGE_TYPE } from '../types/message-types.js';
import './devtools-text-input.js';
import './devtools-checkbox.js';
import './custom-elements-inspector-category.js';

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
        console.log(this.selectedElement);
        return html`
            <div class="splitter" @mousedown=${this.resizeStart}><span></span><span class="header-block"></span></div>

            <div class="action-area">
                ${this.showHeader()}
                ${this.selectedElement
                ? html`
                          ${this.showProperties()} ${this.showAttributes()} ${this.showEvents()} ${this.showMethods()}
                      `
                : ''}
            </div>
        `;
    }

    showHeader() {
        return html`
            <header>
                <h2>${this.selectedElement?.name ?? ''}</h2>
            </header>
        `;
    }

    showProperties() {
        if (!this.selectedElement.properties) return '';
        return html` <div class="properties">
            <custom-elements-inspector-category
                title="Properties"
                .items=${this.selectedElement.properties}
                .values=${this.selectedElement.propertyValues}
            ></custom-elements-inspector-category>
        </div>`;
    }
    showAttributes() {
        if (!this.selectedElement.attributes) return '';
        return html` <div class="attributes">
            <custom-elements-inspector-category
                title="Attributes"
                .items=${this.selectedElement.attributes}
                .values=${this.selectedElement.attributeValues}
            ></custom-elements-inspector-category>
        </div>`;
    }
    showEvents() {
        if (!this.selectedElement.events) return '';
        return html` <div class="events">
            <custom-elements-inspector-category
                title="Events"
                .items=${this.selectedElement.events}
            ></custom-elements-inspector-category>
        </div>`;
    }
    showMethods() {
        if (!this.selectedElement.methods) return '';
        return html` <div class="methods">
            <custom-elements-inspector-category
                title="Methods"
                .items=${this.selectedElement.methods}
            ></custom-elements-inspector-category>
        </div>`;
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
