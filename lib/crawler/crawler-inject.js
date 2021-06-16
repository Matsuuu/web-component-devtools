import { crawlerListenersInject } from "./crawler-listeners";
import { crawlerUtilsInject } from "./crawler-utils";
import { domActionsInject } from "./dom-actions";
import { finderScriptsInject } from "./element-finder";
import { parserInject } from "./element-parser";
import { parserScriptsInject } from "./element-parsers";
import { elementTypesInject } from "./element-types";
import { elementUpdatersInject } from "./element-updaters";

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
`;
