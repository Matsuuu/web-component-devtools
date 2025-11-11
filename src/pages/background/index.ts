import { initConnections } from "./messaging/background-connections";
import { initContextMenu } from "@pages/contextmenu/context-menu";
import "./inject/inject-inpage-scripts";

console.log("background script loaded !");

function initBackground() {
    initConnections();
}

initBackground();
