import { css, html, LitElement } from "lit-element";

export class DevtoolsTextInput extends LitElement {
    static get properties() {
        return {
            placeholder: { type: String },
            value: { type: String },
            name: { type: String },
            type: { type: String },
            label: { type: String },
        };
    }

    constructor() {
        super();

        this.placeholder = "";
        this.value = "";
        this.name = "";
        this.label = "";
        this.type = "text";
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.value;

        this.dispatchEvent(
            new CustomEvent("devtools-input", { detail: { value } })
        );
    }

    render() {
        return html`<label>${this.label}</label>
      <input
        @input=${(e) => this._triggerInput(e)}
        type="${this.type}"
        placeholder=${this.placeholder}
        value=${this.value}
      /> `;
    }

    static get styles() {
        return css`
      :host {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      input {
        height: 100%;
        width: 100%;
        font-size: 0.9rem;
        border-radius: 4px;
        transition: 100ms ease-in-out;
        border: 3px solid #eeeeee;
        outline: none;
          flex-basis: 65%;
      }

      input:focus {
        border: 1px solid cornflowerblue;
        padding: 2px;
      }

      label {
        font-size: 0.9rem;
        padding-right: 1rem;
        padding: 3px;
          flex-basis: 30%;
      }

            :host([nolabel]) input {
                flex-basis: 100%;
            }
            :host([nolabel]) label {
                flex-basis: 0;
            }
    `;
    }
}

if (!customElements.get("devtools-text-input")) {
    customElements.define("devtools-text-input", DevtoolsTextInput);
}