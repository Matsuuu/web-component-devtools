
(async () => {
    console.log("Hello from dom-injector");
    const crawlerInjectModule = await import(chrome.runtime.getURL('crawler-inject.js'));

    console.log(crawlerInjectModule);
    crawlerInjectModule.initDomQueryListener();
    crawlerInjectModule.initDomMutationObservers();
    // import {initDomQueryListener, initDomMutationObservers} from "${crawlerUrl}";
})();
