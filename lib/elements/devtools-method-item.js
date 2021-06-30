import { css, html, LitElement } from 'lit';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { postMessage } from '../util/messaging.js';
import './devtools-action-button.js';
import { DevtoolsTextInput } from './devtools-text-input.js';

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
        postMessage({
            type: MESSAGE_TYPE.CALL_FUNCTION,
            targetIndex: this.selectedElement.indexInDevTools,
            method: this.method,
            parameters: [],
        });
    }

    callMethodWithParams() {
        const params = Array.from(this.shadowRoot.querySelectorAll('devtools-text-input')).map(input =>
            this._parseValue(/** @type DevtoolsTextInput */(input).getValue()),
        );

        postMessage({
            type: MESSAGE_TYPE.CALL_FUNCTION,
            targetIndex: this.selectedElement.indexInDevTools,
            method: this.method,
            parameters: params,
        });
    }

    _parseValue(val) {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val.startsWith('{') || val.startsWith('[')) {
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
                ? html`<devtools-inheritance-indicator
                      parentClass=${this.method.inheritedFrom.name}
                  ></devtools-inheritance-indicator>`
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
                margin-left: -0.85rem;
                width: 100%;
                cursor: pointer;
                user-select: none;
            }

            summary > span {
                display: inline;
                width: 100%;
                pointer-events: none;
            }

            details {
                display: flex;
                width: 100%;
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
