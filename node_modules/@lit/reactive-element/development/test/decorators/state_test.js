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
import { state } from '../../decorators/state.js';
import { generateElementName } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
suite('@state', () => {
    let container;
    let el;
    const hasChanged = (value, old) => old === undefined || value > old;
    class E extends ReactiveElement {
        constructor() {
            super(...arguments);
            this.prop = 'prop';
            this.hasChangedProp = 10;
            this.updateCount = 0;
        }
        update(changed) {
            this.updateCount++;
            super.update(changed);
        }
    }
    __decorate([
        state()
    ], E.prototype, "prop", void 0);
    __decorate([
        state({ hasChanged })
    ], E.prototype, "hasChangedProp", void 0);
    customElements.define(generateElementName(), E);
    setup(async () => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        el = new E();
        container.appendChild(el);
        await el.updateComplete;
    });
    teardown(() => {
        if (container !== undefined) {
            container.parentElement.removeChild(container);
            container = undefined;
        }
    });
    test('triggers update', async () => {
        assert.equal(el.updateCount, 1);
        el.prop = 'change';
        await el.updateComplete;
        assert.equal(el.updateCount, 2);
    });
    test('uses hasChanged', async () => {
        assert.equal(el.updateCount, 1);
        el.hasChangedProp = 100;
        await el.updateComplete;
        assert.equal(el.updateCount, 2);
        el.hasChangedProp = 0;
        await el.updateComplete;
        assert.equal(el.updateCount, 2);
    });
    test('does not set via attribute', async () => {
        el.setAttribute('prop', 'attr');
        assert.equal(el.prop, 'prop');
        await el.updateComplete;
        assert.equal(el.updateCount, 1);
    });
});
//# sourceMappingURL=state_test.js.map