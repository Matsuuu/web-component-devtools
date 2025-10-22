import Browser from "webextension-polyfill";

Browser.devtools.panels
  .create(
    "Web Component DevTools",
    "icon-32.png",
    "src/pages/devtools/index.html",
  )
  .catch(console.error);
