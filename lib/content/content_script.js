import { finderScripts } from "../crawler/element-finder";
import { SpotlightBorder } from "../elements/spotlight-border";

// Inject queryselector script
const script = document.createElement("script");
script.innerHTML = `
${finderScripts}
${SpotlightBorder.toString()}
initDomQueryListener();`;
document.body.appendChild(script);
