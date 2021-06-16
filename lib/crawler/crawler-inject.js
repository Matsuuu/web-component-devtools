import { crawlerListenersInject } from "./crawler-listeners";
import { crawlerUtilsInject } from "./crawler-utils";
import { domActionsInject } from "./dom-actions";
import { finderScriptsInject } from "./element-finder";
import { parserInject } from "./element-parser";
import { parserScriptsInject } from "./element-parsers";
import { elementTypesInject } from "./element-types";
import { elementUpdatersInject } from "./element-updaters";
import * as CONSTANTS from "./crawler-constants.js";

export const crawlerInject = `
${finderScriptsInject}
${crawlerListenersInject}
${crawlerUtilsInject}
${parserInject}
${elementTypesInject}
${elementUpdatersInject}
${domActionsInject}

// Parsers
${parserScriptsInject}
// Updaters
${elementUpdatersInject}
// Constants
${constantInjecter(CONSTANTS)}
`;

/**
    * We work with a lot of constants here, and we want to get them into the injected script.
    * Therefore we must declare them again in the injected string, since we cannot just simply
    * inject them as is.
    * */
function constantInjecter(constantsObject) {
    const constantKeys = Object.keys(constantsObject);
    let injectionString = "";

    constantKeys.forEach(constKey => {
        injectionString += `const ${constKey} = "${constantsObject[constKey].toString()}";\n`;
    });

    return injectionString;
}
