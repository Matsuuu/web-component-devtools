chrome.contextMenus.create({
    title: "Web Components Devtools",
    type: "normal",
    id: "Aaaaaaaaaaaaa",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
    onclick: onWebComponentInspect,
    visible: true, // True if page has web components
});

/**
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
 */
function onWebComponentInspect(info, tab) {
    console.log({ info, tab });

    //TODO(Matsuuu): Trigger query event, after query event is finished,
    // trigger a custom select event, where we know the element.
    // Get the element from
    // window["__WC_DEV_TOOLS_CONTEXT_MENU_TARGET"]
    // and compare/find it and then select that in dev tools
}
