import { html, css, LitElement } from 'lit-element';

export class ListItem extends LitElement {
  static get properties() {
    return {
      selected: { type: Boolean, reflect: true },
      numb: { type: Number, reflect: true }
    };
  }

  constructor() {
    super();
    this.selected = false;
    this.numb = Math.floor(Math.random() * 100 + 1);
  }

  launchAlert(message) {
    alert(message);
  }

  render() {
    return html` <p><slot></slot> ${this.numb}</p> `;
  }

  static get styles() {
    return css`
            :host {
                display: block;
            }

            :host([selected]) {
                background: rgba(0, 0, 200, 0.4);
            }
        `;
  }
}

customElements.define('list-item', ListItem);
