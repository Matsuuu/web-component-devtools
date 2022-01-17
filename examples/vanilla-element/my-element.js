const template = document.createElement('template');
template.innerHTML = `
<style>
</style>

<h2>Hello World!</h2>
<p>Click count: <span id="click-count"></span></p>
<button>Click</button>
`;

export class MyElement extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.count = 0;
        this.title = 'Hello World';

        /** @private */
        this.counterElem = this.shadowRoot.querySelector('#click-count');
        /** @private */
        this.titleElem = this.shadowRoot.querySelector('h2');

        this.connected = false;
    }

    connectedCallback() {
        this.connected = true;
        this.shadowRoot.querySelector('button').addEventListener('click', this._increment.bind(this));
        this.update();
    }

    get count() {
        return this._count;
    }

    set count(newVal) {
        this._count = newVal;
        this.setAttribute("count", this._count);
        this.update();
    }

    get title() {
        return this._title;
    }

    set title(newVal) {
        this._title = newVal;
        this.setAttribute("title", this._title);
        this.update();
    }

    _increment() {
        this.setAttribute('count', this.count + 1);
    }

    setCounter(num) {
        this.setAttribute('count', num.toString());
    }

    update() {
        if (!this.connected) return;
        this.titleElem.innerText = this.title;
        this.counterElem.innerText = this.count;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'count':
                this.count = parseInt(newValue);
                this.dispatchEvent(new CustomEvent('counter-increment', { detail: { count: this.count } }));
                break;
            default:
                this[name] = newValue;
                break;
        }
        this.update();
    }

    static get observedAttributes() {
        return ['count', 'title'];
    }
}

customElements.define('my-element', MyElement);
