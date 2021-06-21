import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { render } from "lit-html";
import { html } from "lit";
import { CONNECTION_CHANNELS } from "../types/connection-channels.js";
import { buildNydus, Nydus } from "../messaging/nydus.js";
import { MESSAGE_TYPE } from "../types/message-types.js";

let nydus;

initConnection();

function initConnection() {
    nydus = buildNydus({
        connections: [
            {
                id: CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT,
                onMessage: onNydusMessage,
                host: true,
            },
        ],
        onReady: onNydusReady,
        onConnect: onNydusConnect,
    });
}

setInterval(() => {
    console.log(nydus);
}, 2000)

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === MESSAGE_TYPE.REFRESH && nydus && nydus.nydusTab === message.tabId) {
        document.dispatchEvent(
            new CustomEvent(message.type.toString(), { detail: message })
        );
        initConnection();
    }
});

/**
 * @param {Nydus} nydus
 */
function onNydusReady(nydus) {
    console.log("Nydus ready", nydus);
    renderView();
    nydus.message(CONNECTION_CHANNELS.DEVTOOLS_PANEL_TO_CONTENT, {
        type: MESSAGE_TYPE.QUERY,
    });
}

/**
 * @param {{ type: { toString: () => string; }; }} message
 */
function onNydusMessage(message) {
    // Send the messages to devtools components using the DOM event API
    document.dispatchEvent(
        new CustomEvent(message.type.toString(), { detail: message })
    );
}

/**
 * @param {Nydus} nydus
 * @param {chrome.runtime.Port} connection
 */
function onNydusConnect(nydus, connection) {
    addListeners(connection);
}

function renderView() {
    document.querySelector(".loading")?.remove();
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

// Handle timeouts
setTimeout(() => {
    const loader = document.querySelector(".loading");
    if (loader) {
        const errorText = document.createElement("p");
        errorText.innerText =
            "Web Components Devtools could not be initialized. Click here to try again.";
        errorText.tabIndex = 0;
        errorText.className = "error";
        errorText.style.cursor = "pointer";
        errorText.addEventListener("click", () => window.location.reload());
        document.body.appendChild(errorText);
    }
}, 4000);
