import { initDomQueryListener } from './crawler-listeners';
import { initDomMutationObservers } from './mutation-observer';
import { SpotlightBorder } from './spotlight-border';

console.log("Starting crawler initiation");
SpotlightBorder.init();
initDomQueryListener();
console.log("initDomMutationObservers Start")
initDomMutationObservers();
console.log("initDomMutationObservers End")
console.log("Crawler initiated");
