import { css, LitElement, unsafeCSS } from "lit";
import mainStyles from "./main.css?inline";

export type LitElementConstructor<T = typeof LitElement> = T & {
  new (...args: any[]): LitElement;
};

export function withTailwind(constructor: LitElementConstructor) {
  const styleInject = css`
    ${unsafeCSS(mainStyles)}
  `;

  // Append to existing array if set
  if (Array.isArray(constructor.styles)) {
    constructor.styles.push(styleInject);
    return;
  }

  // If not value at all, init an array with styles
  if (!constructor.styles) {
    constructor.styles = [styleInject];
    return;
  }

  // If value is set, but is singular instead of array, make it an array.
  constructor.styles = [constructor.styles, styleInject];
}
