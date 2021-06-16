import { crawlerInject } from "../crawler/crawler-inject";
import { SpotlightBorder } from "../elements/spotlight-border";
import "./content-messaging.js";

// Inject devtools DOM scripts
const script = document.createElement("script");

script.innerHTML = `
${crawlerInject}
${SpotlightBorder.toString()}
initDomQueryListener();`;

document.body.appendChild(script);

console.log("Content script injected");
