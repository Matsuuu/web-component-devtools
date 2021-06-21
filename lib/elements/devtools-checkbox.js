import { css, html, LitElement } from "lit-element";

export class DevtoolsCheckbox extends LitElement {
    static get properties() {
        return {
            value: { type: String },
            name: { type: String },
            label: { type: String },
        };
    }

    constructor() {
        super();

        this.value = "";
        this.name = "";
        this.label = "";
    }

    _triggerInput(e) {
        e.stopPropagation();
        const value = e.target.checked;

        this.dispatchEvent(
            new CustomEvent("devtools-input", { detail: { value } })
        );
    }

    render() {
        return html`<label>${this.label}</label>
            <span>
      <input
        @input=${(e) => this._triggerInput(e)}
        type="checkbox"
        ?checked=${this.value}
      /> </span>`;
    }

    static get styles() {
        return css`
      :host {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      input {
        height: 1.3rem;
        width: 1.3rem;
        border-radius: 4px;
        transition: 100ms ease-in-out;
        border: 3px solid #eeeeee;
        outline: none;
        flex-basis: 70%;
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

if (!customElements.get("devtools-checkbox")) {
    customElements.define("devtools-checkbox", DevtoolsCheckbox);
}
