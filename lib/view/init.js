import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { MESSAGE_TYPE } from "../types/message-types.js";
import { render } from "lit-html";
import { html } from "lit";

const ports = {};

renderView();

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port?.sender?.tab?.id;

    if (tabId) {
        ports[tabId] = port;
        console.log("Initializing port ", port);
        console.log("Tab ID: ", tabId);

        port.onMessage.addListener((message, port) => {
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
        port.postMessage(e.detail);
    };

    document.addEventListener("__LIT_DEV_TOOLS_LOG", forwardEvent);
    document.addEventListener("__LIT_DEV_TOOLS_LOG_OBJECT", forwardEvent);
    document.addEventListener("__LIT_DEV_TOOLS_POST_MESSAGE", forwardEvent);

    port.onDisconnect.addListener(() => {
        document.removeEventListener("__LIT_DEV_TOOLS_LOG", forwardEvent);
        document.removeEventListener("__LIT_DEV_TOOLS_LOG_OBJECT", forwardEvent);
        document.removeEventListener("__LIT_DEV_TOOLS_POST_MESSAGE", forwardEvent);
    });
}
