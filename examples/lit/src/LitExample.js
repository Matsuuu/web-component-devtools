import { html, css, LitElement } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import './list-wrapper.js';
import './list-item.js';

export class LitExample extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number, reflect: true },
      user: { type: Object },
      listItems: { type: Array },
      headerElem: { type: Object },
      funcProp: { type: Object },
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
    this.listItems = [
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
      { id: 3, text: 'Bonjour' },
      { id: 5, text: 'Hello' },
      { id: 8, text: 'Hi' },
      { id: 11, text: 'Bonjour' },
      { id: 7, text: 'Hello' },
      { id: 13, text: 'Hi' },
      { id: 6, text: 'Bonjour' },
      { id: 5, text: 'Hello' },
      { id: 3, text: 'Hi' },
      { id: 6, text: 'Bonjour' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
      { id: 3, text: 'Bonjour' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
      { id: 3, text: 'Bonjour' },
      { id: 3, text: 'Hi' },
      { id: 6, text: 'Bonjour' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
      { id: 3, text: 'Bonjour' },
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
      { id: 3, text: 'Bonjour' },
    ];
    this.funcProp = this._actUpon;
    this.headerElem = null;

    /**
     * @type { "Foo" | "Bar" | "Baz" }
     * */
    this.unionField = 'Foo';
  }

  _actUpon() { }

  callSomething() { }

  /**
   * @param { string } stringParam
   * @param { boolean } boolParam
   * @param { number } numberParam
   * @param { MyClass } objectParam
   * @param { any } anyParam
   * */
  doMethod(stringParam, boolParam, numberParam, objectParam, anyParam) {
    console.log({
      stringParam,
      boolParam,
      numberParam,
      objectParam,
      anyParam,
    });
    console.log(typeof stringParam);
    console.log(typeof boolParam);
    console.log(typeof numberParam);
    console.log(typeof objectParam);
    console.log(typeof anyParam);
  }

  __increment() {
    this.counter += 1;
    this.dispatchEvent(new CustomEvent('counter-increment', { detail: { count: this.counter } }));
  }

  firstUpdated() {
    this.headerElem = this.shadowRoot.querySelector('h2');
  }

  render() {
    return html`
            <h2>${this.title}!</h2>
            <button @click=${this.__increment}>increment</button>
            <p>Counter click count: ${this.counter}</p>

            <p>Hello ${this.user?.name}</p>
            <p>Your favorite languages:</p>
            <ul>
                ${this.user?.languages?.map(lang => html`<li>${lang}</li>`)}
            </ul>

            <p>Items in list:</p>
            <list-wrapper>
                ${repeat(
      this.listItems,
      item => item.id,
      item => html`<list-item id=${item.id}>${item.text}</list-item>`,
    )}
            </list-wrapper>

            <demo-undefined-item></demo-undefined-item>
        `;
  }

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
                color: #fff;
            }
        `;
  }
}
