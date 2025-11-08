import { updateTree } from "./events/update-tree";
import { initInpageConnections } from "./inpage-connections";

function initInPage() {
    console.log("Inpage init");
    initInpageConnections();
    updateTree();
}

(() => {
    initInPage();
})();
