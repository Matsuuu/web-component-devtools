/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReactiveElement, } from '../../reactive-element.js';
import { property } from '../../decorators/property.js';
import { generateElementName } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
suite('@property', () => {
    let container;
    setup(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });
    teardown(() => {
        if (container !== undefined) {
            container.parentElement.removeChild(container);
            container = undefined;
        }
    });
    test('property options via decorator', async () => {
        const hasChanged = (value, old) => old === undefined || value > old;
        const fromAttribute = (value) => parseInt(value);
        const toAttribute = (value) => `${value}-attr`;
        class E extends ReactiveElement {
            constructor() {
                super(...arguments);
                this.noAttr = 'noAttr';
                this.atTr = 'attr';
                this.customAttr = 'customAttr';
                this.hasChanged = 10;
                this.fromAttribute = 1;
                this.toAttribute = 1;
                this.all = 10;
                this.updateCount = 0;
            }
            update(changed) {
                this.updateCount++;
                super.update(changed);
            }
        }
        __decorate([
            property({ attribute: false })
        ], E.prototype, "noAttr", void 0);
        __decorate([
            property({ attribute: true })
        ], E.prototype, "atTr", void 0);
        __decorate([
            property({ attribute: 'custom', reflect: true })
        ], E.prototype, "customAttr", void 0);
        __decorate([
            property({ hasChanged })
        ], E.prototype, "hasChanged", void 0);
        __decorate([
            property({ converter: fromAttribute })
        ], E.prototype, "fromAttribute", void 0);
        __decorate([
            property({ reflect: true, converter: { toAttribute } })
        ], E.prototype, "toAttribute", void 0);
        __decorate([
            property({
                attribute: 'all-attr',
                hasChanged,
                converter: { fromAttribute, toAttribute },
                reflect: true,
            })
        ], E.prototype, "all", void 0);
        customElements.define(generateElementName(), E);
        const el = new E();
        container.appendChild(el);
        await el.updateComplete;
        assert.equal(el.updateCount, 1);
        assert.equal(el.noAttr, 'noAttr');
        assert.equal(el.atTr, 'attr');
        assert.equal(el.customAttr, 'customAttr');
        assert.equal(el.hasChanged, 10);
        assert.equal(el.fromAttribute, 1);
        assert.equal(el.toAttribute, 1);
        assert.equal(el.getAttribute('toattribute'), '1-attr');
        assert.equal(el.all, 10);
        assert.equal(el.getAttribute('all-attr'), '10-attr');
        el.setAttribute('noattr', 'noAttr2');
        el.setAttribute('attr', 'attr2');
        el.setAttribute('custom', 'customAttr2');
        el.setAttribute('fromattribute', '2attr');
        el.toAttribute = 2;
        el.all = 5;
        await el.updateComplete;
        assert.equal(el.updateCount, 2);
        assert.equal(el.noAttr, 'noAttr');
        assert.equal(el.atTr, 'attr2');
        assert.equal(el.customAttr, 'customAttr2');
        assert.equal(el.fromAttribute, 2);
        assert.equal(el.toAttribute, 2);
        assert.equal(el.getAttribute('toattribute'), '2-attr');
        assert.equal(el.all, 5);
        el.all = 15;
        await el.updateComplete;
        assert.equal(el.updateCount, 3);
        assert.equal(el.all, 15);
        assert.equal(el.getAttribute('all-attr'), '15-attr');
        el.setAttribute('all-attr', '16-attr');
        await el.updateComplete;
        assert.equal(el.updateCount, 4);
        assert.equal(el.getAttribute('all-attr'), '16-attr');
        assert.equal(el.all, 16);
        el.hasChanged = 5;
        await el.updateComplete;
        assert.equal(el.hasChanged, 5);
        assert.equal(el.updateCount, 4);
        el.hasChanged = 15;
        await el.updateComplete;
        assert.equal(el.hasChanged, 15);
        assert.equal(el.updateCount, 5);
        el.setAttribute('all-attr', '5-attr');
        await el.updateComplete;
        assert.equal(el.all, 5);
        assert.equal(el.updateCount, 5);
        el.all = 15;
        await el.updateComplete;
        assert.equal(el.all, 15);
        assert.equal(el.updateCount, 6);
    });
    test('can decorate user accessor with @property', async () => {
        class E extends ReactiveElement {
            get foo() {
                return this._foo;
            }
            set foo(v) {
                const old = this.foo;
                this._foo = v;
                this.requestUpdate('foo', old);
            }
            updated() {
                this.updatedContent = this.foo;
            }
        }
        __decorate([
            property({ reflect: true, type: Number })
        ], E.prototype, "foo", null);
        customElements.define(generateElementName(), E);
        const el = new E();
        container.appendChild(el);
        await el.updateComplete;
        assert.equal(el._foo, undefined);
        assert.equal(el.updatedContent, undefined);
        assert.isFalse(el.hasAttribute('foo'));
        el.foo = 5;
        await el.updateComplete;
        assert.equal(el._foo, 5);
        assert.equal(el.updatedContent, 5);
        assert.equal(el.getAttribute('foo'), '5');
    });
    test('can mix property options via decorator and via getter', async () => {
        const hasChanged = (value, old) => old === undefined || value > old;
        const fromAttribute = (value) => parseInt(value);
        const toAttribute = (value) => `${value}-attr`;
        class E extends ReactiveElement {
            constructor() {
                super();
                this.hasChanged = 10;
                this.fromAttribute = 1;
                this.toAttribute = 1;
                this.all = 10;
                this.updateCount = 0;
                this.noAttr = 'noAttr';
                this.atTr = 'attr';
                this.customAttr = 'customAttr';
            }
            static get properties() {
                return {
                    noAttr: { attribute: false },
                    atTr: { attribute: true },
                    customAttr: { attribute: 'custom', reflect: true },
                };
            }
            update(changed) {
                this.updateCount++;
                super.update(changed);
            }
        }
        __decorate([
            property({ hasChanged })
        ], E.prototype, "hasChanged", void 0);
        __decorate([
            property({ converter: fromAttribute })
        ], E.prototype, "fromAttribute", void 0);
        __decorate([
            property({ reflect: true, converter: { toAttribute } })
        ], E.prototype, "toAttribute", void 0);
        __decorate([
            property({
                attribute: 'all-attr',
                hasChanged,
                converter: { fromAttribute, toAttribute },
                reflect: true,
            })
        ], E.prototype, "all", void 0);
        customElements.define(generateElementName(), E);
        const el = new E();
        container.appendChild(el);
        await el.updateComplete;
        assert.equal(el.updateCount, 1);
        assert.equal(el.noAttr, 'noAttr');
        assert.equal(el.atTr, 'attr');
        assert.equal(el.customAttr, 'customAttr');
        assert.equal(el.hasChanged, 10);
        assert.equal(el.fromAttribute, 1);
        assert.equal(el.toAttribute, 1);
        assert.equal(el.getAttribute('toattribute'), '1-attr');
        assert.equal(el.all, 10);
        assert.equal(el.getAttribute('all-attr'), '10-attr');
        el.setAttribute('noattr', 'noAttr2');
        el.setAttribute('attr', 'attr2');
        el.setAttribute('custom', 'customAttr2');
        el.setAttribute('fromattribute', '2attr');
        el.toAttribute = 2;
        el.all = 5;
        await el.updateComplete;
        assert.equal(el.updateCount, 2);
        assert.equal(el.noAttr, 'noAttr');
        assert.equal(el.atTr, 'attr2');
        assert.equal(el.customAttr, 'customAttr2');
        assert.equal(el.fromAttribute, 2);
        assert.equal(el.toAttribute, 2);
        assert.equal(el.getAttribute('toattribute'), '2-attr');
        assert.equal(el.all, 5);
        el.all = 15;
        await el.updateComplete;
        assert.equal(el.updateCount, 3);
        assert.equal(el.all, 15);
        assert.equal(el.getAttribute('all-attr'), '15-attr');
        el.setAttribute('all-attr', '16-attr');
        await el.updateComplete;
        assert.equal(el.updateCount, 4);
        assert.equal(el.getAttribute('all-attr'), '16-attr');
        assert.equal(el.all, 16);
        el.hasChanged = 5;
        await el.updateComplete;
        assert.equal(el.hasChanged, 5);
        assert.equal(el.updateCount, 4);
        el.hasChanged = 15;
        await el.updateComplete;
        assert.equal(el.hasChanged, 15);
        assert.equal(el.updateCount, 5);
        el.setAttribute('all-attr', '5-attr');
        await el.updateComplete;
        assert.equal(el.all, 5);
        assert.equal(el.updateCount, 5);
        el.all = 15;
        await el.updateComplete;
        assert.equal(el.all, 15);
        assert.equal(el.updateCount, 6);
    });
    test('property options via decorator do not modify superclass', async () => {
        class E extends ReactiveElement {
            static get properties() {
                return { foo: { type: Number, reflect: true } };
            }
            constructor() {
                super();
                // Avoiding class fields for Babel compat.
                this.foo = 1;
            }
        }
        customElements.define(generateElementName(), E);
        // Note, this forces `E` to finalize
        const el1 = new E();
        class F extends E {
            constructor() {
                super(...arguments);
                this.foo = 2;
            }
        }
        __decorate([
            property({ type: Number })
        ], F.prototype, "foo", void 0);
        customElements.define(generateElementName(), F);
        const el2 = new E();
        const el3 = new F();
        container.appendChild(el1);
        container.appendChild(el2);
        container.appendChild(el3);
        await el1.updateComplete;
        await el2.updateComplete;
        await el3.updateComplete;
        assert.isTrue(el1.hasAttribute('foo'));
        assert.isTrue(el2.hasAttribute('foo'));
        assert.isFalse(el3.hasAttribute('foo'));
    });
    test('can mix properties superclass with decorator on subclass', async () => {
        class E extends ReactiveElement {
            constructor() {
                super();
                // Avoiding class fields for Babel compat.
                this.foo = 'foo';
            }
            static get properties() {
                return {
                    foo: {},
                };
            }
        }
        class F extends E {
            constructor() {
                super(...arguments);
                this.bar = 'bar';
            }
        }
        __decorate([
            property()
        ], F.prototype, "bar", void 0);
        customElements.define(generateElementName(), F);
        const el = new F();
        container.appendChild(el);
        await el.updateComplete;
        el.setAttribute('foo', 'foo2');
        el.setAttribute('bar', 'bar2');
        await el.updateComplete;
        assert.equal(el.foo, 'foo2');
        assert.equal(el.bar, 'bar2');
    });
    test('can customize property options', async () => {
        const myProperty = (options) => property(options);
        class E extends ReactiveElement {
            constructor() {
                super();
                // provide custom deorator expecting extended type
                this.foo = 5;
                this.bar = 'bar';
                // use regular decorator and cast to type
                this.zot = '';
                // Avoiding class fields for Babel compat.
                this.zot2 = '';
                this.foo2 = 5;
            }
            static getPropertyDescriptor(name, key, options) {
                const defaultDescriptor = super.getPropertyDescriptor(name, key, options);
                return {
                    get: defaultDescriptor.get,
                    set(value) {
                        const oldValue = this[name];
                        if (options.validator) {
                            value = options.validator(value);
                        }
                        this[key] = value;
                        this.requestUpdate(name, oldValue);
                    },
                    configurable: defaultDescriptor.configurable,
                    enumerable: defaultDescriptor.enumerable,
                };
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                changedProperties.forEach((value, key) => {
                    const options = this
                        .constructor.getPropertyOptions(key);
                    const observer = options.observer;
                    if (typeof observer === 'function') {
                        observer.call(this, value);
                    }
                });
            }
            // custom typed properties
            static get properties() {
                return {
                    // object cast as type
                    zot2: {
                        observer: function (oldValue) {
                            this._observedZot2 = { value: this.zot2, oldValue };
                        },
                    },
                    // object satisfying defined custom type.
                    foo2: {
                        type: Number,
                        validator: (value) => Math.min(10, Math.max(value, 0)),
                    },
                };
            }
        }
        __decorate([
            myProperty({
                type: Number,
                validator: (value) => Math.min(10, Math.max(value, 0)),
            })
        ], E.prototype, "foo", void 0);
        __decorate([
            property({})
        ], E.prototype, "bar", void 0);
        __decorate([
            property({
                observer: function (oldValue) {
                    this._observedZot = { value: this.zot, oldValue };
                },
            })
        ], E.prototype, "zot", void 0);
        customElements.define(generateElementName(), E);
        const el = new E();
        container.appendChild(el);
        await el.updateComplete;
        el.foo = 20;
        el.foo2 = 20;
        assert.equal(el.foo, 10);
        assert.equal(el.foo2, 10);
        assert.deepEqual(el._observedZot, { value: '', oldValue: undefined });
        assert.deepEqual(el._observedZot2, { value: '', oldValue: undefined });
        el.foo = -5;
        el.foo2 = -5;
        assert.equal(el.foo, 0);
        assert.equal(el.foo2, 0);
        el.bar = 'bar2';
        assert.equal(el.bar, 'bar2');
        el.zot = 'zot';
        el.zot2 = 'zot';
        await el.updateComplete;
        assert.deepEqual(el._observedZot, { value: 'zot', oldValue: '' });
        assert.deepEqual(el._observedZot2, { value: 'zot', oldValue: '' });
    });
});
//# sourceMappingURL=property_test.js.map