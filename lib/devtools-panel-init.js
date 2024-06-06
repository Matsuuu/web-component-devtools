import './elements/devtools-panel.js';
import { CONNECTION_CHANNELS } from './types/connection-channels.js';
import { buildNydus, Nydus } from 'nydus';
import { MESSAGE_TYPE, QueryMessage } from './types/message-types.js';
import { isDarkMode } from './util/devtools-state.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { connectToRouter, CONNECTION_HOSTS, messageIs, PingMessage, PongMessage, sendMessage } from "./messaging/messaging.js"
/**
 * Init.js contains the code which is run onto the devtools panel
 * as the devtools are opened.
 * */


let nydus;

// TODO: Make devtools panel show a disclaimer for pages that are not supported

function setupShoelace() {
    // TODO: Is this okay?
    const SHOELACE_BASE = 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/dist';
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
    sendMessage(CONNECTION_HOSTS.CONTENT, new QueryMessage());
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
        }, 1000)
    }

    // Send the messages to devtools components using the DOM event API
    document.dispatchEvent(new CustomEvent(message.type.toString(), { detail: message }));
}

async function handleDevMode() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.querySelector("devtools-panel")?.removeAttribute("loading");
    //////////////// onNydusReady(nydus);
    const queryData = await fetch('http://localhost:8000/devdata/query-mock-data.json').then(res => res.json());
    const selectData = await fetch('http://localhost:8000/devdata/select-mock-data.json').then(res => res.json());

    onMessage(queryData);
    onMessage(selectData);
}

chrome?.runtime?.onMessage.addListener(async message => {
    if (message.type === MESSAGE_TYPE.REFRESH && nydus && nydus.nydusTab === message.tabId) {
        window.location.reload();
    }
});

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND, {
        type: MESSAGE_TYPE.QUERY,
    });
}


/**
 * @param {Nydus} nydus
 * @param {chrome.runtime.Port} connection
 */
function onNydusConnect(nydus, connection) {
    addListeners(connection);
}

/**
 * @param {chrome.runtime.Port} port
 */
function addListeners(port) {
    const forwardEvent = (/** @type { CustomEvent } */ e) => {
        port.postMessage({ ...e.detail, tabId: nydus.nydusTab });
    };

    FORWARD_EVENTS.forEach(ev => {
        document.addEventListener(ev, forwardEvent);
    });
}

const FORWARD_EVENTS = ['__WC_DEV_TOOLS_LOG', '__WC_DEV_TOOLS_LOG_OBJECT', '__WC_DEV_TOOLS_POST_MESSAGE'];
