/*import { crawlerInject } from "../crawler/crawler-inject";
import { SpotlightBorder } from "../elements/spotlight-border";
import "./content-messaging.js";
import { init } from "./content-messaging.js";

function injectScript() {
    // Inject devtools DOM scripts
    const script = document.createElement("script");
    script.type = "module";

    script.innerHTML = `
        ${crawlerInject}
        ${SpotlightBorder.toString()}
    `;

    script.setAttribute("web-component-devtools-script", "");
    document.head.appendChild(script);
}

injectScript();
init();
*/

// We are doing a dynamic import here since content scripts are quite iffy
// about using module scripts and therefore we can't import stuff otherwise.
//
(async () => {
    const crawelerInjectModule = await import(chrome.extension.getURL('crawler_inject.js'));
    const spotlightBorderModule = await import(chrome.extension.getURL('spotlight_border.js'));
    const contentMessagingModule = await import(chrome.extension.getURL('content_messaging.js'));

    function injectScript() {
        // Inject devtools DOM scripts
        const script = document.createElement('script');
        script.type = 'module';

        script.innerHTML = `
        ${crawelerInjectModule.crawlerInject}
        ${spotlightBorderModule.SpotlightBorder.toString()}
    `;

        script.setAttribute('web-component-devtools-script', '');
        document.head.appendChild(script);
    }

    //injectScript();
    setTimeout(() => {
        contentMessagingModule.init();
    }, 500)
})();
