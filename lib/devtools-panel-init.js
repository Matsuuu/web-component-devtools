import "./elements/devtools-panel.js";
import {
    MESSAGE_TYPE,
    QueryMessage,
    QueryResultMessage,
    RefreshMessage,
    SelectMessage,
} from "./types/message-types.js";
import { isDarkMode } from "./util/devtools-state.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import {
    connectToRouter,
    CONNECTION_HOSTS,
    messageIs,
    PingMessage,
    PongMessage,
    sendMessage,
    HandshakeMessage,
} from "./messaging/messaging.js";
/**
 * Init.js contains the code which is run onto the devtools panel
 * as the devtools are opened.
 * */

let nydus;

// TODO: Make devtools panel show a disclaimer for pages that are not supported

function setupShoelace() {
    // TODO: Is this okay?
    const SHOELACE_BASE = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/dist";
    setBasePath(SHOELACE_BASE);
}

setupShoelace();

function checkDarkMode() {
    if (isDarkMode()) {
        document.body.setAttribute("dark-mode", "");
    }
}
checkDarkMode();
// Makes it faster to develop the devtools UI when you can
// just have it as a separate instance with `npm run start:ui`
function isUIDev() {
    return window.location.search.includes("devmode");
}

initConnection();

function initConnection() {
    if (isUIDev()) {
        handleDevMode();
        return;
    }

    connectToRouter(CONNECTION_HOSTS.DEVTOOLS, onMessage);
    addListeners();
}

/**
 * @param {any} message
 */
function onMessage(message) {
    console.log("ON MESSAGE TO DEVTOOLS ", message);
    if (messageIs(message, PingMessage)) {
        setTimeout(() => {
            console.log("Ping");
            sendMessage(CONNECTION_HOSTS.CONTENT, new PongMessage());
            console.log(document);
            console.log(window);
        }, 1000);
    }
    if (messageIs(message, HandshakeMessage)) {
        sendMessage(CONNECTION_HOSTS.CONTENT, new QueryMessage());
    }

    // Send the messages to devtools components using the DOM event API
    document.dispatchEvent(new CustomEvent(message.type.toString(), { detail: message }));
}

async function handleDevMode() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.querySelector("devtools-panel")?.removeAttribute("loading");
    //////////////// onNydusReady(nydus);
    const queryData = await fetch("http://localhost:8000/devdata/query-mock-data.json").then(res => res.json());
    const selectData = await fetch("http://localhost:8000/devdata/select-mock-data.json").then(res => res.json());

    onMessage(new QueryResultMessage(queryData));
    onMessage(new SelectMessage(selectData));
}

chrome?.runtime?.onMessage.addListener(async message => {
    if (message.type === MESSAGE_TYPE.REFRESH && nydus && nydus.nydusTab === message.tabId) {
        window.location.reload();
    }

    if (messageIs(message, RefreshMessage)) {
        window.location.reload();
    }
});

function addListeners() {
    const forwardEvent = (/** @type { CustomEvent } */ e) => {
        sendMessage(CONNECTION_HOSTS.CONTENT, { ...e.detail });
    };

    const FORWARD_EVENTS = ["__WC_DEV_TOOLS_LOG", "__WC_DEV_TOOLS_LOG_OBJECT", "__WC_DEV_TOOLS_POST_MESSAGE"];

    FORWARD_EVENTS.forEach(ev => {
        document.addEventListener(ev, forwardEvent);
    });
}
