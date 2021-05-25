/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
export declare const supportsAdoptingStyleSheets: boolean;
export declare type CSSResultOrNative = CSSResult | CSSStyleSheet;
export declare type CSSResultFlatArray = CSSResultOrNative[];
export declare type CSSResultArray = Array<CSSResultOrNative | CSSResultArray>;
export declare type CSSResultGroup = CSSResultOrNative | CSSResultArray;
export declare class CSSResult {
    readonly cssText: string;
    private _styleSheet?;
    constructor(cssText: string, safeToken: symbol);
    get styleSheet(): CSSStyleSheet | undefined;
    toString(): string;
}
/**
 * Wrap a value for interpolation in a [[`css`]] tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */
export declare const unsafeCSS: (value: unknown) => CSSResult;
/**
 * Template tag which which can be used with LitElement's [[LitElement.styles |
 * `styles`]] property to set element styles. For security reasons, only literal
 * string values may be used. To incorporate non-literal values [[`unsafeCSS`]]
 * may be used inside a template string part.
 */
export declare const css: (strings: TemplateStringsArray, ...values: (CSSResultGroup | number)[]) => CSSResultGroup;
/**
 * Applies the given styles to a `shadowRoot`. When Shadow DOM is
 * available but `adoptedStyleSheets` is not, styles are appended to the
 * `shadowRoot` to [mimic spec behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
 * Note, when shimming is used, any styles that are subsequently placed into
 * the shadowRoot should be placed *before* any shimmed adopted styles. This
 * will match spec behavior that gives adopted sheets precedence over styles in
 * shadowRoot.
 */
export declare const adoptStyles: (renderRoot: ShadowRoot, styles: CSSResultFlatArray) => void;
export declare const getCompatibleStyle: (s: CSSResultOrNative) => CSSResultOrNative;
//# sourceMappingURL=css-tag.d.ts.map