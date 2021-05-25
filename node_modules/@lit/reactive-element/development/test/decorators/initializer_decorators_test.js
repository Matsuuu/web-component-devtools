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
import { ReactiveElement } from '../../reactive-element.js';
import { generateElementName } from '../test-helpers.js';
import { decorateProperty } from '../../decorators/base.js';
import { assert } from '@esm-bundle/chai';
import { property } from '../../decorators/property.js';
suite('Decorators using initializers', () => {
    let container;
    setup(async () => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    teardown(() => {
        container.parentElement.removeChild(container);
    });
    test('can create initializer decorator with `decorateProperty`', async () => {
        const wasDecorated = (value) => decorateProperty({
            finisher: (ctor, name) => {
                ctor.addInitializer((e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    e.decoration = { name, value };
                });
            },
        });
        class A extends ReactiveElement {
        }
        __decorate([
            wasDecorated('bar')
        ], A.prototype, "foo", void 0);
        customElements.define(generateElementName(), A);
        const el = new A();
        container.appendChild(el);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assert.deepEqual(el.decoration, { name: 'foo', value: 'bar' });
    });
    test('can create `listen` controller decorator', async () => {
        const listeners = new WeakMap();
        const listenWindow = (type) => {
            return decorateProperty({
                finisher: (ctor, name) => {
                    ctor.addInitializer((e) => {
                        const listener = (event) => ctor.prototype[name].call(e, event);
                        let l = listeners.get(e);
                        if (l === undefined) {
                            listeners.set(e, (l = []));
                            e.addController({
                                hostConnected() {
                                    l.forEach((info) => {
                                        window.addEventListener(info.type, info.listener);
                                    });
                                },
                                hostDisconnected() {
                                    l.forEach((info) => {
                                        window.removeEventListener(info.type, info.listener);
                                    });
                                },
                            });
                        }
                        l.push({ type, listener });
                    });
                },
            });
        };
        class B extends ReactiveElement {
            eventHandler1(e) {
                this.event1 = e.type;
            }
            eventHandler2(e) {
                this.event2 = e.type;
            }
        }
        __decorate([
            listenWindow('nug')
        ], B.prototype, "eventHandler1", null);
        __decorate([
            listenWindow('zug')
        ], B.prototype, "eventHandler2", null);
        customElements.define(generateElementName(), B);
        const el = new B();
        container.appendChild(el);
        document.body.dispatchEvent(new Event('nug', { bubbles: true }));
        document.body.dispatchEvent(new Event('zug', { bubbles: true }));
        assert.equal(el.event1, 'nug');
        assert.equal(el.event2, 'zug');
        el.event1 = undefined;
        el.event2 = undefined;
        container.removeChild(el);
        document.body.dispatchEvent(new Event('nug', { bubbles: true }));
        document.body.dispatchEvent(new Event('zug', { bubbles: true }));
        assert.isUndefined(el.event1);
        assert.isUndefined(el.event2);
    });
    test('can create `validate` controller decorator', async () => {
        const validators = new WeakMap();
        const validate = (validatorFn) => {
            return decorateProperty({
                finisher: (ctor, name) => {
                    ctor.addInitializer((e) => {
                        let v = validators.get(e);
                        if (v === undefined) {
                            validators.set(e, (v = []));
                            e.addController({
                                hostUpdate() {
                                    v.forEach(({ key, validator }) => {
                                        e[key] = validator(e[key]);
                                    });
                                },
                            });
                        }
                        v.push({ key: name, validator: validatorFn });
                    });
                },
            });
        };
        class B extends ReactiveElement {
            constructor() {
                super(...arguments);
                this.foo = 5;
            }
        }
        __decorate([
            property(),
            validate((v) => Math.max(0, Math.min(10, v)))
        ], B.prototype, "foo", void 0);
        customElements.define(generateElementName(), B);
        const el = new B();
        container.appendChild(el);
        await el.updateComplete;
        assert.equal(el.foo, 5);
        el.foo = 100;
        await el.updateComplete;
        assert.equal(el.foo, 10);
        el.foo = -100;
        await el.updateComplete;
        assert.equal(el.foo, 0);
    });
    test('can create `observer` controller decorator', async () => {
        const observers = new WeakMap();
        const observer = (observerFn) => {
            return decorateProperty({
                finisher: (ctor, name) => {
                    ctor.addInitializer((e) => {
                        let v = observers.get(e);
                        if (v === undefined) {
                            observers.set(e, (v = []));
                            e.addController({
                                hostUpdated() {
                                    v.forEach((info) => {
                                        var _a, _b;
                                        const value = e[info.key];
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const hasChanged = (_b = (_a = e.constructor.getPropertyOptions(name)) === null || _a === void 0 ? void 0 : _a.hasChanged) !== null && _b !== void 0 ? _b : Object.is;
                                        if (hasChanged(value, info.previousValue)) {
                                            info.observer.call(e, value, info.previousValue);
                                            info.previousValue = value;
                                        }
                                    });
                                },
                            });
                        }
                        v.push({ key: name, observer: observerFn });
                    });
                },
            });
        };
        class B extends ReactiveElement {
            constructor() {
                super(...arguments);
                this.foo = 5;
                this.bar = 'bar';
            }
        }
        __decorate([
            property(),
            observer(function (value, previous) {
                this._observedFoo = { value, previous };
            })
        ], B.prototype, "foo", void 0);
        __decorate([
            property(),
            observer(function (value, previous) {
                this._observedBar = { value, previous };
            })
        ], B.prototype, "bar", void 0);
        customElements.define(generateElementName(), B);
        const el = new B();
        container.appendChild(el);
        await el.updateComplete;
        assert.deepEqual(el._observedFoo, { value: 5, previous: undefined });
        assert.deepEqual(el._observedBar, { value: 'bar', previous: undefined });
        el.foo = 100;
        el.bar = 'bar2';
        await el.updateComplete;
        assert.deepEqual(el._observedFoo, { value: 100, previous: 5 });
        assert.deepEqual(el._observedBar, { value: 'bar2', previous: 'bar' });
    });
});
//# sourceMappingURL=initializer_decorators_test.js.map