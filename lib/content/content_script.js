
// We are doing a dynamic import here since content scripts are quite iffy
// about using module scripts and therefore we can't import stuff otherwise.
//
// This also reduces the package size and requirements on bundling by a LOT
(async () => {
    const crawlerUrl = chrome.extension.getURL('crawler-inject.js'); // 
    const spotlightUrl = chrome.extension.getURL('spotlight-border.js');
    const contentMessagingModule = await import(chrome.extension.getURL('content-messaging.js'));

    function injectScript() {
        // Inject devtools DOM scripts
        const script = document.createElement('script');
        script.type = 'module';


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
