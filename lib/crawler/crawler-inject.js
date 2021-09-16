import { crawlerListenersInject, initDomQueryListener } from './crawler-listeners';
import { crawlerUtilsInject } from './crawler-utils';
import { domActionsInject } from './dom-actions';
import { finderScriptsInject } from './element-finder';
import { parserInject } from './element-parser';
import { parserScriptsInject } from './element-parsers';
import { elementTypesInject } from './element-types';
import { elementUpdatersInject } from './element-updaters';
import * as CONSTANTS from './crawler-constants.js';
import { mutationInject } from './mutation-observer';
import { eventObserversInject } from './event-observer';
import { initDomMutationObservers } from "./mutation-observer";

export const crawlerInject = `
/**
* This is a content script injected by the Web Component Devtools
* to assist with DOM operations and other actions.
* */

${finderScriptsInject}
${crawlerListenersInject}
${crawlerUtilsInject}
${parserInject}
${elementTypesInject}
${elementUpdatersInject}
${domActionsInject}
${initDomMutationObservers.toString()}

// Parsers
${parserScriptsInject}
// Updaters
${elementUpdatersInject}
// Mutation
${mutationInject}
// Events
${eventObserversInject}
// Constants
${constantInjecter(CONSTANTS)}

// Init
initDomQueryListener();
initDomMutationObservers();
`;

/**
 * We work with a lot of constants here, and we want to get them into the injected script.
 * Therefore we must declare them again in the injected string, since we cannot just simply
 * inject them as is.
 * */
function constantInjecter(constantsObject) {
    const constantKeys = Object.keys(constantsObject);
    let injectionString = '';

    constantKeys.forEach(constKey => {
        injectionString += `const ${constKey} = "${constantsObject[constKey].toString()}";\n`;
    });

    return injectionString;
}

export { initDomMutationObservers, initDomQueryListener };
