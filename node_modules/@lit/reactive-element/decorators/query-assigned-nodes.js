import{decorateProperty as e}from"./base.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=Element.prototype,n=t.msMatchesSelector||t.webkitMatchesSelector;function o(t="",o=!1,r=""){return e({descriptor:e=>({get(){var e,l;const i="slot"+(t?`[name=${t}]`:":not([name])");let a=null===(l=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(i))||void 0===l?void 0:l.assignedNodes({flatten:o});return a&&r&&(a=a.filter((e=>e.nodeType===Node.ELEMENT_NODE&&(e.matches?e.matches(r):n.call(e,r))))),a},enumerable:!0,configurable:!0})})}export{o as queryAssignedNodes};
//# sourceMappingURL=query-assigned-nodes.js.map
