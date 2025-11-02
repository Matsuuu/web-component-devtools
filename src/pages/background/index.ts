import { initConnections } from "./background-connections";

console.log("background script loaded !");

function initBackground() {
    initConnections();
}

initBackground();
