import{decorateProperty as t}from"./base.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function o(o,r){return t({descriptor:t=>{const i={get(){var t;return null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(o)},enumerable:!0,configurable:!0};if(r){const r="symbol"==typeof t?Symbol():"__"+t;i.get=function(){var t;return void 0===this[r]&&(this[r]=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(o)),this[r]}}return i}})}export{o as query};
//# sourceMappingURL=query.js.map
