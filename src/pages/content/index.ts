import { initConnection } from "./content-connection";
import { getDOMTree } from "./lib/tree-walker";

initContentScript();

export function initContentScript() {
    getDOMTree();
    initConnection();
}
