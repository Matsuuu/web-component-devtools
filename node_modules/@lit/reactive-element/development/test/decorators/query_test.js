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
import { query } from '../../decorators/query.js';
import { canTestReactiveElement, generateElementName, RenderingElement, html, } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
(canTestReactiveElement ? suite : suite.skip)('@query', () => {
    let container;
    let el;
    class C extends RenderingElement {
        constructor() {
            super();
            // Avoiding class fields for Babel compat.
            this.condition = false;
        }
        render() {
            return html `
        <div>Not this one</div>
        <div id="blah">This one</div>
        ${this.condition ? html `<span>Cached</span>` : ``}
      `;
        }
    }
    C.properties = { condition: {} };
    __decorate([
        query('#blah')
    ], C.prototype, "div", void 0);
    __decorate([
        query('#blah', true)
    ], C.prototype, "divCached", void 0);
    __decorate([
        query('span', true)
    ], C.prototype, "span", void 0);
    customElements.define(generateElementName(), C);
    setup(async () => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        el = new C();
        container.appendChild(el);
        await el.updateComplete;
    });
    teardown(() => {
        if (container !== undefined) {
            container.parentElement.removeChild(container);
            container = undefined;
        }
    });
    test('returns an element when it exists', () => {
        const div = el.div;
        assert.instanceOf(div, HTMLDivElement);
        assert.equal(div.innerText, 'This one');
    });
    test('returns null when no match', () => {
        assert.isNull(el.span);
    });
    test('returns cached value', async () => {
        el.condition = true;
        await el.updateComplete;
        // trigger caching, so we can verify that multiple elements can be cached
        el.divCached;
        assert.equal(el.divCached, el.renderRoot.querySelector('#blah'));
        assert.equal(el.span, el.renderRoot.querySelector('span'));
        assert.instanceOf(el.span, HTMLSpanElement);
        el.condition = false;
        await el.updateComplete;
        assert.instanceOf(el.span, HTMLSpanElement);
        assert.notEqual(el.span, el.renderRoot.querySelector('span'));
    });
});
//# sourceMappingURL=query_test.js.map