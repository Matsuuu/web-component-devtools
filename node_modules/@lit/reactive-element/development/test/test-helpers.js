/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _a;
import { ReactiveElement } from '../reactive-element.js';
let count = 0;
export const generateElementName = () => `x-${count++}`;
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
export const getComputedStyleValue = (element, property) => window.ShadyCSS
    ? window.ShadyCSS.getComputedStyleValue(element, property)
    : getComputedStyle(element).getPropertyValue(property);
export const stripExpressionComments = (html) => html.replace(/<!--\?lit\$[0-9]+\$-->|<!---->/g, '');
// Only test if ShadowRoot is available and either ShadyDOM is not
// in use or it is and platform support is available.
export const canTestReactiveElement = (window.ShadowRoot && !((_a = window.ShadyDOM) === null || _a === void 0 ? void 0 : _a.inUse)) ||
    window.reactiveElementPlatformSupport;
export class RenderingElement extends ReactiveElement {
    render() {
        return '';
    }
    update(changedProperties) {
        const result = this.render();
        super.update(changedProperties);
        if (result !== undefined) {
            // Save and replace any existing styles in root to simulate
            // adoptedStylesheets.
            const styles = this.renderRoot.querySelectorAll('style');
            this.renderRoot.innerHTML = result;
            this.renderRoot.append(...styles);
        }
    }
}
export const html = (strings, ...values) => {
    return values.reduce((a, v, i) => a + v + strings[i + 1], strings[0]);
};
//# sourceMappingURL=test-helpers.js.map