import { css, html, LitElement } from "lit";
import { log } from "../../../util/messaging";
import { MESSAGE_TYPE, RefreshMessage } from "../../../types/message-types.js";
import "../../inspector-elements/devtools-inspector-category.js";
import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";

const MESSAGING_CHANNEL = "CustomElementsInspector";

export class DevToolsInspector extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
            selectedElementParseError: { type: Boolean },
            customElementsList: { type: Object },
            loading: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();

        this.reload();
        this.customElementsList = null;
        this.selectedElementParseError = false;
        this.loading = true;
        this._initSubChannel();
    }

    reload() {
        /** @type import('../../../types/devtools-element').DevToolsElement */
        this.selectedElement = null;
    }

    _initSubChannel() {
        document.addEventListener(RefreshMessage.type, this.reload.bind(this));
    }

    render() {
        return html`
            <div class="action-area">
                ${this.showHeader()}
                ${this.selectedElementParseError
                    ? html`
                          <p class="error-text">Web Component DevTools wasn't able to parse this component's data.</p>
                          <p class="error-text">
                              If this happens more than once, please
                              <a target="_blank" href="https://github.com/Matsuuu/web-component-devtools/issues"
                                  >Submit a Bug Report</a
                              >
                          </p>
                      `
                    : ""}
                ${this.selectedElement
                    ? html`
                          ${this.showProperties()} ${this.showAttributes()} ${this.showEvents()} ${this.showMethods()}
                      `
                    : ""}
            </div>
        `;
    }

    showHeader() {
        if (this.loading) {
            return html`
                <header>
                    <h2>Loading...</h2>
                </header>
            `;
        }

        return html`
            <header>
                <h2>${this.selectedElement?.name ?? ""}</h2>
                ${this.selectedElement?.parentClass
                    ? html`
                          <devtools-property-indicators
                              dir="down"
                              type="inheritance"
                              hovertext="Extends ${this.selectedElement.parentClass?.name}"
                          ></devtools-property-indicators>
                      `
                    : ""}
            </header>
        `;
    }

    showProperties() {
        if (!this.selectedElement.properties || this.selectedElement.properties.length <= 0) return "";
        return html` <div class="properties">
            <devtools-inspector-category
                categoryTitle="Properties"
                .items=${this.selectedElement.properties}
                .values=${this.selectedElement.propertyValues}
                .selectedElement=${this.selectedElement}
                categoryType="properties"
            ></devtools-inspector-category>
        </div>`;
    }
    showAttributes() {
        if (!this.selectedElement.attributes || this.selectedElement.attributes.length <= 0) return "";
        return html` <div class="attributes">
            <devtools-inspector-category
                categoryTitle="Attributes"
                .items=${this.selectedElement.attributes}
                .values=${this.selectedElement.attributeValues}
                .selectedElement=${this.selectedElement}
                categoryType="attributes"
            ></devtools-inspector-category>
        </div>`;
    }
    showEvents() {
        if (!this.selectedElement.events || this.selectedElement.events.length <= 0) return "";
        return html` <div class="events">
            <devtools-inspector-category
                categoryTitle="Events"
                .items=${this.selectedElement.events}
                .selectedElement=${this.selectedElement}
                categoryType="events"
            ></devtools-inspector-category>
        </div>`;
    }
    showMethods() {
        if (!this.selectedElement.methods || this.selectedElement.methods.length <= 0) return "";
        return html` <div class="methods">
            <devtools-inspector-category
                categoryTitle="Methods"
                .items=${this.selectedElement.methods}
                .selectedElement=${this.selectedElement}
                categoryType="methods"
            ></devtools-inspector-category>
        </div>`;
    }

    static get styles() {
        return css`
            :host {
                flex-basis: 100%;
                display: flex;

                height: 100%;
                max-height: 100%;
                overflow-y: auto;
                box-sizing: border-box;
            }

            .action-area {
                width: 100%;
                display: flex;
                flex-direction: column;
            }

            .error-text {
                color: red;
                text-align: center;
            }

            header {
                display: flex;
                align-items: center;
                border-bottom: 2px solid var(--border-color);
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0.75rem 1rem 0.5rem 0.5rem;
            }

            header h2 {
                font-size: 1rem;
                color: var(--headline-color);
                margin: 0;
            }

            @media only screen and (max-width: 1000px) {
                :host {
                    flex-direction: column;
                    flex-basis: 100%;
                }

                header h2 {
                    margin: 0;
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

if (!customElements.get("devtools-inspector")) {
    customElements.define("devtools-inspector", DevToolsInspector);
}
