import { findAllElements, findCustomElements, highlightElement, initDomQueryListener } from "../crawler/element-finder";
import {
    parseElements,
} from "../crawler/element-jsonifier";
import { MESSAGE_TYPE } from "../types/message-types";

const port = chrome.runtime.connect({ name: "Lit Devtools" });

port.onMessage.addListener(function(message) {
    switch (message.type) {
        case MESSAGE_TYPE.LOG:
            if (typeof message.log === "object") console.log("", message.log);
            else console.log(message.log);
            break;
        case MESSAGE_TYPE.LOG_OBJECT:
            console.log(message.log, message.data);
            break;
        case MESSAGE_TYPE.INIT:
            break;
        case MESSAGE_TYPE.QUERY:
            doQuery(port);
            break;
        case MESSAGE_TYPE.HIGHLIGHT:
            document.dispatchEvent(new CustomEvent("__LIT_DEV_TOOLS_HIGHLIGHT_ELEMENT", { detail: { index: message.index } }));
            break;
    }
});

/**
 * @param {chrome.runtime.Port} port
 */
function doQuery(port) {
    const queryResponse = waitForQueryResponse();
    document.dispatchEvent(new CustomEvent("__LIT_DEV_TOOLS_QUERY_REQUEST"));

    queryResponse.then((res) => {
        console.log(res.detail);
        port.postMessage({ type: MESSAGE_TYPE.QUERY_RESULT, data: res.detail });
    });
}

function waitForQueryResponse() {
    // TODO(matsu): Do we need to give this a timeout for reject?
    return new Promise((resolve, reject) => {
        document.addEventListener(
            "__LIT_DEV_TOOLS_QUERY_RESULT",
            (e) => {
                resolve(e)
            },
            { once: true }
        );
    });
}

port.postMessage({ type: MESSAGE_TYPE.INIT });

// Inject queryselector script
const script = document.createElement("script");
script.innerHTML = `
${initDomQueryListener.toString()}
${parseElements.toString()}
${findCustomElements.toString()}
${findAllElements.toString()}
${highlightElement.toString()}
initDomQueryListener();`;
document.body.appendChild(script);
