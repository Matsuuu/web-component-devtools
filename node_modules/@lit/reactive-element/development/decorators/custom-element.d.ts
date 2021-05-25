/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { Constructor, ClassDescriptor } from './base.js';
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```
 * @customElement('my-element')
 * class MyElement extends LitElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @category Decorator
 * @param tagName The tag name of the custom element to define.
 */
export declare const customElement: (tagName: string) => (classOrDescriptor: Constructor<HTMLElement> | ClassDescriptor) => any;
//# sourceMappingURL=custom-element.d.ts.map