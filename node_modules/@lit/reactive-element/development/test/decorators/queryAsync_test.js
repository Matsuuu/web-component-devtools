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
import { queryAsync } from '../../decorators/query-async.js';
import { canTestReactiveElement, generateElementName, RenderingElement, html, } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
(canTestReactiveElement ? suite : suite.skip)('@queryAsync', () => {
    let container;
    let el;
    class C extends RenderingElement {
        constructor() {
            super();
            // Avoiding class fields for Babel compat.
            this.foo = false;
        }
        render() {
            return html `
        <div>Not this one</div>
        ${this.foo
                ? html `<div id="blah" foo>This one</div>`
                : html `<div id="blah">This one</div>`}
      `;
        }
    }
    C.properties = { foo: {} };
    __decorate([
        queryAsync('#blah')
    ], C.prototype, "blah", void 0);
    __decorate([
        queryAsync('span')
    ], C.prototype, "nope", void 0);
    customElements.define(generateElementName(), C);
    setup(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        el = new C();
        container.appendChild(el);
    });
    teardown(() => {
        if (container !== undefined) {
            container.parentElement.removeChild(container);
            container = undefined;
        }
    });
    test('returns an element when it exists after update', async () => {
        let div = await el.blah;
        assert.instanceOf(div, HTMLDivElement);
        assert.isFalse(div.hasAttribute('foo'));
        el.foo = true;
        div = await el.blah;
        assert.instanceOf(div, HTMLDivElement);
        assert.isTrue(div.hasAttribute('foo'));
    });
    test('returns null when no match', async () => {
        const span = await el.nope;
        assert.isNull(span);
    });
});
//# sourceMappingURL=queryAsync_test.js.map