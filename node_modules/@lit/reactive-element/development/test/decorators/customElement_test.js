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
import { customElement } from '../../decorators/custom-element.js';
import { generateElementName } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
suite('@customElement', () => {
    test('defines an element', () => {
        const tagName = generateElementName();
        let C0 = class C0 extends HTMLElement {
        };
        C0 = __decorate([
            customElement(tagName)
        ], C0);
        const DefinedC = customElements.get(tagName);
        assert.strictEqual(DefinedC, C0);
    });
});
//# sourceMappingURL=customElement_test.js.map