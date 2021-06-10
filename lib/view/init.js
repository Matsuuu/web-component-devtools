import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { render } from "lit-html";
import { html } from "lit";
import { CONNECTION_TYPES } from "../types/connection-types.js";

const ports = {};

renderView();

chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== CONNECTION_TYPES.DEVTOOLS_GENERAL) return;

    const tabId = port?.sender?.tab?.id;

    if (tabId) {
        ports[tabId] = port;
        console.log("Initializing port ", port);
        console.log("Tab ID: ", tabId);

        port.onMessage.addListener((message, port) => {
            console.log("onmessage", message);
            // Send the messages to devtools components using the DOM event API
            document.dispatchEvent(
                new CustomEvent(message.type.toString(), { detail: message })
            );
        });

        addListeners(port);
    }
});

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

    FORWARD_EVENTS.forEach(ev => {
        document.addEventListener(ev, forwardEvent);
    });

    port.onDisconnect.addListener(() => {
        FORWARD_EVENTS.forEach(ev => {
            document.removeEventListener(ev, forwardEvent);
        });
    })
}

const FORWARD_EVENTS = [
    "__WC_DEV_TOOLS_LOG",
    "__WC_DEV_TOOLS_LOG_OBJECT",
    "__WC_DEV_TOOLS_POST_MESSAGE",
];
