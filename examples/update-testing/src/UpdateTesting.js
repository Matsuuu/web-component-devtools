import { html, css, LitElement } from 'lit-element';

export class UpdateTesting extends LitElement {
    static get styles() {
        return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--update-testing-text-color, #000);
      }
    `;
    }

    static get properties() {
        return {
            title: { type: String },
            counter: { type: Number },
            items: { type: Array }
        };
    }

    constructor() {
        super();
        this.title = 'Hey there';
        this.counter = 5;
        this.items = [];
    }

    firstUpdated() {
        setInterval(() => {
            this.items.push("Foo");
            if (this.items.length > 5) {
                this.items = [];
            }
            this.requestUpdate();
        }, 750);
    }

    __increment() {
        this.counter += 1;
    }

    render() {
        return html`
      <h2>${this.title} Nr. ${this.counter}!</h2>
      <button @click=${this.__increment}>increment</button>
      ${this.items.map((item, i) => html`<list-item .index=${i} .text=${item}></list-item>`)}
    `;
    }
}
