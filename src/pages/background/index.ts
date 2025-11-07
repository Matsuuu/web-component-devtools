import { initConnections } from "./messaging/background-connections";

console.log("background script loaded !");

function initBackground() {
    initConnections();
}

initBackground();
