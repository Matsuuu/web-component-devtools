import { findAllElements, findCustomElements } from "../crawler/element-finder";
import { initDomQueryListener, parseElements } from "../crawler/element-jsonifier";
import { MESSAGE_TYPE } from "../types/message-types";

const port = chrome.runtime.connect({ name: "Lit Devtools" })

port.onMessage.addListener(function(message) {
    switch (message.type) {
        case MESSAGE_TYPE.LOG:
            if (typeof message.log === "object")
                console.log("", message.log);
            else
                console.log(message.log);
            break;
        case MESSAGE_TYPE.LOG_OBJECT:
            console.log(message.log, message.data);
            break;
        case MESSAGE_TYPE.INIT:

            break;
        case MESSAGE_TYPE.QUERY:
            const queryResponse = waitForQueryResponse();
            document.dispatchEvent(new CustomEvent("__LIT_DEV_TOOLS_QUERY_REQUEST"));
            break;
    }
});


function waitForQueryResponse() {
    return new Promise((resolve, reject) => {
        document.addEventListener("__LIT_DEV_TOOLS_QUERY_RESULT", (e) => {
            console.log("DATA IN THE DEV TOOLS END", e);
            resolve(e)
        });
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
initDomQueryListener();
`;
document.body.appendChild(script);
