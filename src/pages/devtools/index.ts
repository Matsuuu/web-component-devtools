import browser from "webextension-polyfill";

browser.devtools.panels
    .create("Web Component DevTools", "/public/dev-icon-32.png", "/src/pages/devtools/panel.html")
    .catch(console.error);
