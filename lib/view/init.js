import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { render } from "lit-html";
import { html } from "lit";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";
import { MESSAGE_TYPE } from "../types/message-types.js";

initConnection();

let nydus;

function initConnection() {
    nydus = buildNydus({
        requiredConnections: [{
            id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT,
            onMessage: onNydusMessage,
            host: true
        }],
        onReady: onNydusReady,
        onConnect: onNydusConnect
    });
}

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    console.log("Communication with Content script initialized", nydus);
    renderView();
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, { type: MESSAGE_TYPE.QUERY });
}

function onNydusMessage(message) {
    console.log("onmessage", message);
    // Send the messages to devtools components using the DOM event API
    document.dispatchEvent(
        new CustomEvent(message.type.toString(), { detail: message })
    );
}

function onNydusConnect(nydus, connection) {
    addListeners(connection);
}

function renderView() {
    document.body.innerHTML = "";
    render(
        html`
      <custom-elements-list></custom-elements-list>
      <custom-elements-inspector></custom-elements-inspector>
    `,
        document.body
    );
}

/**
 * @param {chrome.runtime.Port} port
 */
function addListeners(port) {
    const forwardEvent = (/** @type { CustomEvent } */ e) => {
        console.log("Trying to forward event", e);
        port.postMessage(e.detail);
    };

    FORWARD_EVENTS.forEach((ev) => {
        document.addEventListener(ev, forwardEvent);
    });

    port.onDisconnect.addListener(() => {
        FORWARD_EVENTS.forEach((ev) => {
            document.removeEventListener(ev, forwardEvent);
        });
    });
}

const FORWARD_EVENTS = [
    "__WC_DEV_TOOLS_LOG",
    "__WC_DEV_TOOLS_LOG_OBJECT",
    "__WC_DEV_TOOLS_POST_MESSAGE",
];
