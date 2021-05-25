/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { RenderOptions } from 'lit-html';
export declare const generateElementName: () => string;
export declare const nextFrame: () => Promise<unknown>;
export declare const getComputedStyleValue: (element: Element, property: string) => string;
export declare const stripExpressionComments: (html: string) => string;
export declare const canTestLitElement: true | ((options: {
    [index: string]: any;
}) => void);
export interface ShadyRenderOptions extends RenderOptions {
    scope?: string;
}
//# sourceMappingURL=test-helpers.d.ts.map