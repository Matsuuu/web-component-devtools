import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { render } from "lit-html";
import { html } from "lit";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";

renderView();
initConnection();

function initConnection() {
    const nydus = buildNydus({
        requiredConnections: [CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT],
        onBuild: onNydusBuild,
        onReady: onNydusReady,
        onConnect: onNydusConnect
    });
}

/**
 * @param {Nydus} nydus
 */
function onNydusBuild(nydus) {
    nydus.addConnection(
        CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT,
        false,
        onNydusMessage
    );
}

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    console.log("Communication with Content script initialized", nydus);
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
