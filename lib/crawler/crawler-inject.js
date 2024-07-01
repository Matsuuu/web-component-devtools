import { initDomQueryListener } from './crawler-listeners';
import { initDomMutationObservers } from './mutation-observer';
import { SpotlightBorder } from './spotlight-border';


SpotlightBorder.init();
initDomQueryListener();
initDomMutationObservers();
