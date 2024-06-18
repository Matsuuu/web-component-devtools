import { css, html, LitElement } from 'lit';
import { CONNECTION_HOSTS, sendMessage } from '../../messaging/messaging.js';
import { CallFunctionMessage } from '../../types/message-types.js';
import './devtools-action-button.js';
import { DevToolsTextInput } from './inputs/devtools-text-input.js';

export class DevToolsMethodItem extends LitElement {
    static get properties() {
        return {
            method: { type: Object },
            selectedElement: { type: Object },
        };
    }

    constructor() {
        super();

        this.method = null;
        this.selectedElement = null;
    }

    openParams() {
        this.shadowRoot.querySelector('details').setAttribute('open', '');
    }

    callMethod() {
        sendMessage(CONNECTION_HOSTS.CONTENT, new CallFunctionMessage({
            targetIndex: this.selectedElement.indexInDevTools,
            method: this.method,
            parameters: [],
            tagName: this.selectedElement.tagName
        }));
    }

    callMethodWithParams() {
        const params = Array.from(this.shadowRoot.querySelectorAll('devtools-text-input')).map(input =>
            this._parseValue(/** @type DevToolsTextInput */(input).getValue()),
        );

        sendMessage(CONNECTION_HOSTS.CONTENT, new CallFunctionMessage({
            targetIndex: this.selectedElement.indexInDevTools,
            method: this.method,
            parameters: params,
            tagName: this.selectedElement.tagName
        }));
    }

    _parseValue(val) {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
            try {
                return JSON.parse(val);
            } catch (err) {
                return val;
            }
        }

        return val;
    }

    _hasParams() {
        return this.method.parameters && this.method.parameters.length > 0;
    }

    render() {
        if (!this.method.name) return '';
        return html`
            ${this._hasParams()
                ? html`
                      <details>
                          <summary>
                              <span>
                                  <label>${this.method?.name}:</label
                                  ><devtools-action-button
                                      secondary
                                      label="Set Params"
                                      @click=${this.openParams}
                                  ></devtools-action-button>
                              </span>
                          </summary>
                          <div class="param-list">
                              ${this.method.parameters.map(
                    param => html`
                                      <devtools-text-input
                                          type="text"
                                          label=${param.name}
                                          .value=${param?.default ?? ''}
                                      ></devtools-text-input>
                                  `,
                )}
                          </div>
                          <devtools-action-button
                              class="param-function-caller"
                              primary
                              label="Call Function"
                              @click=${this.callMethodWithParams}
                          ></devtools-action-button>
                      </details>
                  `
                : html`
                      <label>${this.method?.name}:</label
                      ><devtools-action-button
                          primary
                          label="Call Function"
                          @click=${this.callMethod}
                      ></devtools-action-button>
                  `}
            ${this.method.inheritedFrom
                ? html` <devtools-property-indicators .property=${this.method}></devtools-property-indicators> `
                : ''}
        `;
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

if (!customElements.get('devtools-method-item')) {
    customElements.define('devtools-method-item', DevToolsMethodItem);
}
