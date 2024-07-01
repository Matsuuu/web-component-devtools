
// We are doing a dynamic import here since content scripts are quite iffy
// about using module scripts and therefore we can't import stuff otherwise.
//

// This also reduces the package size and requirements on bundling by a LOT
(async () => {
    const blocklistModule = await import(chrome.runtime.getURL('block-list.js'));
    if (blocklistModule.siteIsOnBlockList(window.location.href)) {
        return;
    }

    const contentMessagingModule = await import(chrome.runtime.getURL('content-messaging.js'));

    contentMessagingModule.init();
})();
