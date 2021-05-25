/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { decorateProperty } from './base.js';
/**
 * A property decorator that converts a class property into a getter that
 * executes a querySelector on the element's renderRoot.
 *
 * @param selector A DOMString containing one or more selectors to match.
 * @param cache An optional boolean which when true performs the DOM query only
 *     once and caches the result.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * @example
 *
 * ```ts
 * class MyElement {
 *   @query('#first')
 *   first;
 *
 *   render() {
 *     return html`
 *       <div id="first"></div>
 *       <div id="second"></div>
 *     `;
 *   }
 * }
 * ```
 * @category Decorator
 */
export function query(selector, cache) {
    return decorateProperty({
        descriptor: (name) => {
            const descriptor = {
                get() {
                    var _a;
                    return (_a = this.renderRoot) === null || _a === void 0 ? void 0 : _a.querySelector(selector);
                },
                enumerable: true,
                configurable: true,
            };
            if (cache) {
                const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
                descriptor.get = function () {
                    var _a;
                    if (this[key] === undefined) {
                        this[key] = (_a = this.renderRoot) === null || _a === void 0 ? void 0 : _a.querySelector(selector);
                    }
                    return this[key];
                };
            }
            return descriptor;
        },
    });
}
//# sourceMappingURL=query.js.map