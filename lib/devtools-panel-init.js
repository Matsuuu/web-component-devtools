import './elements/devtools-panel.js';
import { CONNECTION_CHANNELS } from './types/connection-channels.js';
import { buildNydus, Nydus } from 'nydus';
import { MESSAGE_TYPE } from './types/message-types.js';
import { isDarkMode } from './util/devtools-state.js';
/**
 * Init.js contains the code which is run onto the devtools panel
 * as the devtools are opened.
 * */

let nydus;

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
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND,
                onMessage: onNydusMessage,
                host: false,
                isBackground: true,
            },
        ],
        onReady: onNydusReady,
        onConnect: onNydusConnect,
    });

    if (isUIDev()) {
        handleDevMode();
    }
}

async function handleDevMode() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.querySelector("devtools-panel")?.removeAttribute("loading");
    onNydusReady(nydus);
    const queryData = await fetch('http://localhost:8000/devdata/query-mock-data.json').then(res => res.json());
    const selectData = await fetch('http://localhost:8000/devdata/select-mock-data.json').then(res => res.json());

    onNydusMessage(queryData);
    onNydusMessage(selectData);
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
 * @param {{ type: { toString: () => string; }; }} message
 */
function onNydusMessage(message) {
    // Send the messages to devtools components using the DOM event API
    document.dispatchEvent(new CustomEvent(message.type.toString(), { detail: message }));
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
