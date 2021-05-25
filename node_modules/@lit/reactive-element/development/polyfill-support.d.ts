/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * ReactiveElement patch to support browsers without native web components.
 *
 * This module should be used in addition to loading the web components
 * polyfills via @webcomponents/webcomponentjs. When using those polyfills
 * support for polyfilled Shadow DOM is automatic via the ShadyDOM polyfill, but
 * support for Shadow DOM like css scoping is opt-in. This module uses ShadyCSS
 * to scope styles defined via the `static styles` property.
 *
 * @packageDocumentation
 */
interface RenderOptions {
    readonly renderBefore?: ChildNode | null;
    scope?: string;
}
declare const SCOPED = "__scoped";
declare type CSSResults = Array<{
    cssText: string;
} | CSSStyleSheet>;
interface PatchableReactiveElementConstructor {
    [SCOPED]: boolean;
    elementStyles: CSSResults;
    shadowRootOptions: ShadowRootInit;
    _$handlesPrepareStyles?: boolean;
}
interface PatchableReactiveElement extends HTMLElement {
    new (...args: any[]): PatchableReactiveElement;
    constructor: PatchableReactiveElementConstructor;
    connectedCallback(): void;
    hasUpdated: boolean;
    _$didUpdate(changedProperties: unknown): void;
    createRenderRoot(): Element | ShadowRoot;
    renderOptions: RenderOptions;
}
//# sourceMappingURL=polyfill-support.d.ts.map