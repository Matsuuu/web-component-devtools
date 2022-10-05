import { initDomQueryListener } from './crawler-listeners';
import { initDomMutationObservers } from './mutation-observer';
import { SpotlightBorder } from './spotlight-border';

/*export * from './crawler-listeners';
export * from './crawler-utils';
export * from './dom-actions';
export * from './element-finder';
export * from './element-parser';
export * from './element-parsers';
export * from './element-types';
export * from './element-updaters';
export * from './crawler-constants.js';
export * from './mutation-observer';
export * from './event-observer';*/

console.log("Starting crawler initiation");
SpotlightBorder.init();
initDomQueryListener();
initDomMutationObservers();
console.log("Crawler initiated");
