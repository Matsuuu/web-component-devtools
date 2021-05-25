/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { ReactiveElement, PropertyValues } from '../reactive-element.js';
export declare const generateElementName: () => string;
export declare const nextFrame: () => Promise<unknown>;
export declare const getComputedStyleValue: (element: Element, property: string) => string;
export declare const stripExpressionComments: (html: string) => string;
export declare const canTestReactiveElement: true | ((options: {
    [index: string]: any;
}) => void);
export declare class RenderingElement extends ReactiveElement {
    render(): string | undefined;
    update(changedProperties: PropertyValues): void;
}
export declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => string;
//# sourceMappingURL=test-helpers.d.ts.map