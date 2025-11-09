import { log, LogLevel } from "../../lib/logger/log";
import { updateTree } from "./events/update-tree";
import { initInpageConnections } from "./inpage-connections";

function initInPage() {
    if (window.____WC_DEVTOOLS_INPAGE_INITIALIZED) {
        return;
    }
    log(LogLevel.DEBUG, "Inpage Init");
    window.____WC_DEVTOOLS_INPAGE_INITIALIZED = true;
    initInpageConnections();
    updateTree();
}

// This is the inpage script root, which will initialize everything we need to
// have to run code inside of the actual Web Component Dev Tools' inspected page.
//
// This file and everything imported in it will we loaded in as it's own bundle
// as an IIFE module, and will execute the code as it's injected onto the user's
// web page.
(() => {
    initInPage();
})();

declare global {
    interface Window {
        ____WC_DEVTOOLS_INPAGE_INITIALIZED: boolean;
    }
}
