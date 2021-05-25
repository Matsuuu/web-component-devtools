/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { ReactiveElement } from '../reactive-element.js';
/**
 * A property decorator that converts a class property into a getter that
 * returns the `assignedNodes` of the given named `slot`. Note, the type of
 * this property should be annotated as `NodeListOf<HTMLElement>`.
 *
 * @param slotName A string name of the slot.
 * @param flatten A boolean which when true flattens the assigned nodes,
 *     meaning any assigned nodes that are slot elements are replaced with their
 *     assigned nodes.
 * @param selector A string which filters the results to elements that match
 *     the given css selector.
 *
 * * @example
 * ```ts
 * class MyElement {
 *   @queryAssignedNodes('list', true, '.item')
 *   listItems;
 *
 *   render() {
 *     return html`
 *       <slot name="list"></slot>
 *     `;
 *   }
 * }
 * ```
 * @category Decorator
 */
export declare function queryAssignedNodes(slotName?: string, flatten?: boolean, selector?: string): (protoOrDescriptor: ReactiveElement | import("./base.js").ClassElement, name?: string | number | symbol | undefined) => any;
//# sourceMappingURL=query-assigned-nodes.d.ts.map