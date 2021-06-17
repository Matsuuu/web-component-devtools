import { css, html, LitElement } from "lit-element";

export class DevtoolsTextInput extends LitElement {

    static get properties() {
        return {
            placeholder: { type: String },
            value: { type: String },
            name: { type: String }
        };
    }

    constructor() {
        super();

        this.placeholder = "";
        this.value = "";
        this.name = "";
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.value;

        this.dispatchEvent(new CustomEvent("devtools-input", { detail: { value } }));
    }

    render() {
        return html` <input @input=${e => this._triggerInput(e)} type="text" placeholder=${this.placeholder} value=${this.value} /> `;
    }

    static get styles() {
        return css`
      :host {
        display: flex;
      }

      input {
        height: 100%;
        width: 100%;
        font-size: 1.3rem;
        border-radius: 4px;
        transition: 100ms ease-in-out;
        border: 3px solid #eeeeee;
          outline: none;
      }

        input:focus {
        border: 1px solid cornflowerblue;
        }
    `;
    }
}

if (!customElements.get("devtools-text-input")) {
    customElements.define("devtools-text-input", DevtoolsTextInput);
}
