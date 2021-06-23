import { css, html, LitElement } from 'lit-element';
import './devtools-action-button.js';

export class DevToolsMethodItem extends LitElement {
    static get properties() {
        return {
            method: { type: Object },
        };
    }

    constructor() {
        super();

        this.method = null;
    }

    firstUpdated() {
        console.log(this.method);
    }

    openParams() {
        this.shadowRoot.querySelector('details').setAttribute('open', '');
    }

    callFunction() { }

    callFunctionWithParams() { }

    _hasParams() {
        return this.method.parameters && this.method.parameters.length > 0;
    }

    render() {
        if (!this.method.name) return '';
        return html` ${this._hasParams()
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
                          @click=${this.callFunctionWithParams}
                      ></devtools-action-button>
                  </details>
              `
            : html`
                  <label>${this.method?.name}:</label
                  ><devtools-action-button
                      primary
                      label="Call Function"
                      @click=${this.callFunction}
                  ></devtools-action-button>
              `}`;
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
