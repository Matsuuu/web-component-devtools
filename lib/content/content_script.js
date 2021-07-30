import { crawlerInject } from "../crawler/crawler-inject";
import { SpotlightBorder } from "../elements/spotlight-border";
import "./content-messaging.js";
import { init } from "./content-messaging.js";

function injectScript() {
    // Inject devtools DOM scripts
    const script = document.createElement("script");

    script.innerHTML = `
        ${crawlerInject}
        ${SpotlightBorder.toString()}
    `;

    script.setAttribute("web-component-devtools-script", "");
    document.head.appendChild(script);
}

injectScript();
init();
