import Browser from "webextension-polyfill";
import "./style.css";
import "./web-awesome";
import "./panel";

Browser.devtools.panels
  .create(
    "Web Component DevTools",
    "icon-32.png",
    "src/pages/devtools/index.html",
  )
  .catch(console.error);
