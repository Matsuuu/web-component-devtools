import '/lib/elements/custom-elements-list.js';
import '/lib/elements/custom-elements-inspector.js';
import { render } from 'lit-html';
import { html } from 'lit';
import { CONNECTION_CHANNELS } from '../types/connection-channels.js';
import { buildNydus, Nydus } from 'nydus';
import { MESSAGE_TYPE } from '../types/message-types.js';
/**
 * Init.js contains the code which is run onto the devtools panel
 * as the devtools are opened.
 * */

let nydus;

initConnection();

function initConnection() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_BACKGROUND,
                onMessage: onNydusMessage,
                host: false,
                isBackground: true
            },
        ],
        onReady: onNydusReady,
        onConnect: onNydusConnect,
    });
}

chrome.runtime.onMessage.addListener(async message => {
    if (message.type === MESSAGE_TYPE.REFRESH && nydus && nydus.nydusTab === message.tabId) {
        window.location.reload();
    }
});

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    renderView();
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

function renderView() {
    document.querySelector('.loading')?.remove();
    render(
        html`
            <custom-elements-list></custom-elements-list>
            <custom-elements-inspector></custom-elements-inspector>
        `,
        document.body,
    );
}

/**
 * @param {chrome.runtime.Port} port
 */
function addListeners(port) {
    const forwardEvent = (/** @type { CustomEvent } */ e) => {
        port.postMessage(e.detail);
    };

    FORWARD_EVENTS.forEach(ev => {
        document.addEventListener(ev, forwardEvent);
    });
}

const FORWARD_EVENTS = ['__WC_DEV_TOOLS_LOG', '__WC_DEV_TOOLS_LOG_OBJECT', '__WC_DEV_TOOLS_POST_MESSAGE'];

// Handle timeouts
setTimeout(() => {
    const loader = document.querySelector('.loading');
    if (loader) {
        // Reload the window if it hung
        window.location.reload();
    }
}, 5000);
