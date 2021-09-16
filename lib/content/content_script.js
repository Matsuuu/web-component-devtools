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
    const crawlerUrl = chrome.extension.getURL('crawler_inject.js');
    const spotlightUrl = chrome.extension.getURL('spotlight_border.js');
    const crawlerInjectModule = await import(crawlerUrl);
    const spotlightBorderModule = await import(spotlightUrl);
    const contentMessagingModule = await import(chrome.extension.getURL('content_messaging.js'));

    function injectScript() {
        // Inject devtools DOM scripts
        const script = document.createElement('script');
        script.type = 'module';

        console.log(crawlerInjectModule)
        script.innerHTML = `
        import {initDomQueryListener, initDomMutationObservers} from "${crawlerUrl}";
        import { SpotlightBorder } from "${spotlightUrl}"
        SpotlightBorder.init();
initDomQueryListener();
initDomMutationObservers();
    `;
        //${crawlerInjectModule.crawlerInject}
        //${spotlightBorderModule.SpotlightBorder.toString()}

        script.setAttribute('web-component-devtools-script', '');
        document.head.appendChild(script);
    }

    injectScript();
    contentMessagingModule.init();
})();
