import { css, html, LitElement } from 'lit';
import { log, postMessage } from '../util/messaging';
import { MESSAGE_TYPE } from '../types/message-types.js';
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
     * @param {any} element
     */
    setSelectedElement(element) {
        if (this.selectedElement?.indexInDevTools !== element?.index) {
            postMessage({
                type: MESSAGE_TYPE.SELECT,
                indexInDevTools: element.index,
                name: element.name,
                tagName: element.name,
            });
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
            document.removeEventListener('mouseleave', removeListener);
        };
        document.addEventListener('mouseup', removeListener);
        document.addEventListener('mouseleave', removeListener);
    }

    resizeEnd() {
        document.removeEventListener('mousemove', this.onResizeMouseMoveListener);
    }

    render() {
        return html`
            <div class="splitter" @mousedown=${this.resizeStart}><span></span></div>

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
                ${this.selectedElement?.parentClass
                ? html`
                          <devtools-inheritance-indicator
                              extends
                              dir="down"
                              .parentClass=${this.selectedElement.parentClass.name}
                          ></devtools-inheritance-indicator>
                      `
                : ''}
            </header>
        `;
    }

    showProperties() {
        if (!this.selectedElement.properties || this.selectedElement.properties.length <= 0) return '';
        return html` <div class="properties">
            <custom-elements-inspector-category
                title="Properties"
                .items=${this.selectedElement.properties}
                .values=${this.selectedElement.propertyValues}
                .selectedElement=${this.selectedElement}
                categoryType="properties"
            ></custom-elements-inspector-category>
        </div>`;
    }
    showAttributes() {
        if (!this.selectedElement.attributes || this.selectedElement.attributes.length <= 0) return '';
        return html` <div class="attributes">
            <custom-elements-inspector-category
                title="Attributes"
                .items=${this.selectedElement.attributes}
                .values=${this.selectedElement.attributeValues}
                .selectedElement=${this.selectedElement}
                categoryType="attributes"
            ></custom-elements-inspector-category>
        </div>`;
    }
    showEvents() {
        if (!this.selectedElement.events || this.selectedElement.events.length <= 0) return '';
        return html` <div class="events">
            <custom-elements-inspector-category
                title="Events"
                .items=${this.selectedElement.events}
                .selectedElement=${this.selectedElement}
                categoryType="events"
            ></custom-elements-inspector-category>
        </div>`;
    }
    showMethods() {
        if (!this.selectedElement.methods || this.selectedElement.methods.length <= 0) return '';
        return html` <div class="methods">
            <custom-elements-inspector-category
                title="Methods"
                .items=${this.selectedElement.methods}
                .selectedElement=${this.selectedElement}
                categoryType="methods"
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
                width: 95%;
                display: flex;
                flex-direction: column;
                padding-bottom: 5rem;
                margin-top: -0.5rem;
            }

            header {
                display: flex;
                align-items: center;
                border-bottom: 2px solid #eeeeee;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0.5rem 1rem;
            }

            header h2 {
                font-size: 1rem;
                color: var(--headline-color);
            }

            .splitter {
                position: sticky;
                background: var(--background-color);
                top: 0;
                width: 4px;
                height: 100%;
                padding: 0 1rem;
                display: flex;
                cursor: col-resize;
            }

            .splitter > span {
                width: inherit;
                height: 100%;
                background: var(--highlight);
                position: relative;
            }

            .splitter > span:before,
            .splitter > span:after {
                content: '';
                position: absolute;
                background: var(--highlight);
                width: 2px;
                height: 1rem;
                top: 0;
                bottom: 0;
                margin: auto;
            }

            .splitter > span:after {
                right: 0.3rem;
            }
            .splitter > span:before {
                left: 0.3rem;
            }

            @media only screen and (max-width: 1000px) {
                :host {
                    --inspector-size: 60%;
                    flex-direction: column;
                    flex-basis: var(--inspector-size);
                }

                header h2 {
                    margin: 0;
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
                .splitter > span:after,
                .splitter > span:before {
                    width: 1rem;
                    height: 2px;
                    left: 0;
                    right: 0;
                }

                .splitter > span:after {
                    bottom: 0.3rem;
                }
                .splitter > span:before {
                    top: 0.3rem;
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
