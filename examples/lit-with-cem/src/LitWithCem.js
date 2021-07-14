import { html, css, LitElement } from 'lit-element';
import "./list-wrapper.js";
import "./list-item.js";
import "./list-icon.js";
import "./fancy-title.js";

export class LitWithCem extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                padding: 25px;
                color: var(--lit-no-cem-text-color, #000);
            }

            :host([status='waiting']) .status-text {
               background: yellow; 
            }

            :host([status='ready']) .status-text {
               background: green; 
                color: #FFF;
            }
        `;
    }

    static get properties() {
        return {
            title: { type: String },
            counter: { type: Number, reflect: true },
            user: { type: Object },
            status: { type: String, reflect: true }
        };
    }

    constructor() {
        super();
        this.title = 'Hey there';
        this.counter = 5;
        this.user = {
            id: 22,
            name: 'Matsuuu',
            languages: ['Java', 'Javascript'],
        };
        /** @type { 'waiting' | 'ready' } */
        this.status = "waiting";
    }

    __increment() {
        this.counter += 1;
        this.dispatchEvent(new CustomEvent('counter-increment', { detail: { count: this.counter } }));
    }

    render() {
        return html`
            <h2>${this.title} Nr. ${this.counter}!</h2>
            <button @click=${this.__increment}>increment</button>

            <p>Hello ${this.user?.name}</p>
            <p>Your status currently: <span class="status-text">${this.status}</span></p>
            <p>Your favorite languages:</p>
            <ul>
                ${this.user?.languages?.map(lang => html`<li>${lang}</li>`)}
            </ul>

            <list-wrapper>
                <fancy-title slot="header">Hey I'm a title</fancy-title>
                <list-item>Foo</list-item>
                <list-item>Bar</list-item>
                <list-item>Baz</list-item>
                <list-item>Bin</list-item>
            </list-wrapper>
        `;
    }
}
