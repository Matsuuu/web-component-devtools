import { MyElement } from "./my-element.js";

export class MyInheritingElement extends MyElement {
    constructor() {
        super();
        this.foo = "bar";
    }
}
customElements.define('my-inheriting-element', MyInheritingElement);
