import { updateTree } from "./events/update-tree";
import { initInpageConnections } from "./inpage-connections";

function initInPage() {
    if (window.____WC_DEVTOOLS_INPAGE_INITIALIZED) {
        return;
    }
    window.____WC_DEVTOOLS_INPAGE_INITIALIZED = true;
    initInpageConnections();
    updateTree();
}

(() => {
    initInPage();
})();

declare global {
    interface Window {
        ____WC_DEVTOOLS_INPAGE_INITIALIZED: boolean;
    }
}
