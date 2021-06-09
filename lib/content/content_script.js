import { finderScripts } from "../crawler/element-finder";
import { SpotlightBorder } from "../elements/spotlight-border";
import "./content-messaging.js";

// Inject queryselector script
const script = document.createElement("script");
script.innerHTML = `
${finderScripts}
${SpotlightBorder.toString()}
initDomQueryListener();`;
document.body.appendChild(script);

console.log("Content script injected");
