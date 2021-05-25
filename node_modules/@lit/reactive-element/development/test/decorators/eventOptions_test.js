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
import { eventOptions } from '../../decorators/event-options.js';
import { canTestReactiveElement, generateElementName, RenderingElement, html, } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
let hasOptions;
const supportsOptions = (function () {
    if (hasOptions !== undefined) {
        return hasOptions;
    }
    const fn = () => { };
    const event = 'foo';
    hasOptions = false;
    const options = {
        get capture() {
            hasOptions = true;
            return true;
        },
    };
    document.body.addEventListener(event, fn, options);
    document.body.removeEventListener(event, fn, options);
    return hasOptions;
})();
let hasPassive;
const supportsPassive = (function () {
    if (hasPassive !== undefined) {
        return hasPassive;
    }
    // Use an iframe since ShadyDOM will pass this test but doesn't actually
    // enforce passive behavior.
    const f = document.createElement('iframe');
    document.body.appendChild(f);
    const fn = () => { };
    const event = 'foo';
    hasPassive = false;
    const options = {
        get passive() {
            hasPassive = true;
            return true;
        },
    };
    f.contentDocument.addEventListener(event, fn, options);
    f.contentDocument.removeEventListener(event, fn, options);
    document.body.removeChild(f);
    return hasPassive;
})();
let hasOnce;
const supportsOnce = (function () {
    if (hasOnce !== undefined) {
        return hasOnce;
    }
    // Use an iframe since ShadyDOM will pass this test but doesn't actually
    // enforce passive behavior.
    const f = document.createElement('iframe');
    document.body.appendChild(f);
    const fn = () => { };
    const event = 'foo';
    hasOnce = false;
    const options = {
        get once() {
            hasOnce = true;
            return true;
        },
    };
    f.contentDocument.addEventListener(event, fn, options);
    f.contentDocument.removeEventListener(event, fn, options);
    document.body.removeChild(f);
    return hasOnce;
})();
(canTestReactiveElement ? suite : suite.skip)('@eventOptions', () => {
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
    test('allows capturing listeners', async function () {
        if (!supportsOptions) {
            this.skip();
        }
        class C extends RenderingElement {
            onClick(e) {
                this.eventPhase = e.eventPhase;
            }
            render() {
                return html `<div><button></button></div>`;
            }
            firstUpdated() {
                this.renderRoot
                    .querySelector('div')
                    .addEventListener('click', (e) => this.onClick(e), this.onClick);
            }
        }
        __decorate([
            eventOptions({ capture: true })
        ], C.prototype, "onClick", null);
        customElements.define(generateElementName(), C);
        const c = new C();
        container.appendChild(c);
        await c.updateComplete;
        c.renderRoot.querySelector('button').click();
        assert.equal(c.eventPhase, Event.CAPTURING_PHASE);
    });
    test('allows once listeners', async function () {
        if (!supportsOnce) {
            this.skip();
        }
        class C extends ReactiveElement {
            constructor() {
                super();
                this.clicked = 0;
                this.addEventListener('click', () => this.onClick(), this.onClick);
            }
            onClick() {
                this.clicked++;
            }
        }
        __decorate([
            eventOptions({ once: true })
        ], C.prototype, "onClick", null);
        customElements.define(generateElementName(), C);
        const c = new C();
        container.appendChild(c);
        await c.updateComplete;
        c.click();
        c.click();
        assert.equal(c.clicked, 1);
    });
    test('allows passive listeners', async function () {
        if (!supportsPassive) {
            this.skip();
        }
        class C extends ReactiveElement {
            constructor() {
                super();
                this.addEventListener('click', (e) => this.onClick(e), this.onClick);
            }
            onClick(e) {
                try {
                    e.preventDefault();
                }
                catch (error) {
                    // no need to do anything
                }
                this.defaultPrevented = e.defaultPrevented;
            }
        }
        __decorate([
            eventOptions({ passive: true })
        ], C.prototype, "onClick", null);
        customElements.define(generateElementName(), C);
        const c = new C();
        container.appendChild(c);
        await c.updateComplete;
        c.click();
        assert.isFalse(c.defaultPrevented);
    });
});
//# sourceMappingURL=eventOptions_test.js.map