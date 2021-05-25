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
import { queryAll } from '../../decorators/query-all.js';
import { canTestReactiveElement, generateElementName, RenderingElement, html, } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
(canTestReactiveElement ? suite : suite.skip)('@queryAll', () => {
    let container;
    let el;
    class C extends RenderingElement {
        render() {
            return html `
        <div>Not this one</div>
        <div id="blah">This one</div>
      `;
        }
    }
    __decorate([
        queryAll('div')
    ], C.prototype, "divs", void 0);
    __decorate([
        queryAll('span')
    ], C.prototype, "spans", void 0);
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
    test('returns elements when they exists', () => {
        assert.lengthOf(el.divs, 2);
        assert.deepEqual(Array.from(el.divs), Array.from(el.renderRoot.querySelectorAll('div')));
    });
    test('returns empty NodeList when no match', () => {
        assert.lengthOf(el.spans, 0);
        assert.deepEqual(Array.from(el.spans), Array.from(el.renderRoot.querySelectorAll('span')));
    });
});
//# sourceMappingURL=queryAll_test.js.map