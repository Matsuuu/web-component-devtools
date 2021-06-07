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
            document.dispatchEvent(
                new CustomEvent("__LIT_DEV_TOOLS_HIGHLIGHT_ELEMENT", {
                    detail: { index: message.index },
                })
            );
            break;
        case MESSAGE_TYPE.SELECT:
            doSelect(port, message.index);
            break;
    }
});

port.postMessage({ type: MESSAGE_TYPE.INIT });

/**
 * @param {chrome.runtime.Port} port
 */
function doQuery(port) {
    const queryResponse = waitForDomMessageResponse(
        "__LIT_DEV_TOOLS_QUERY_RESULT"
    );
    document.dispatchEvent(new CustomEvent("__LIT_DEV_TOOLS_QUERY_REQUEST"));

    queryResponse.then((res) => {
        console.log(res.detail);
        port.postMessage({ type: MESSAGE_TYPE.QUERY_RESULT, data: res.detail });
    });
}

/**
 * @param {chrome.runtime.Port} port
 * @param {number} index
 */
function doSelect(port, index) {
    const selectResponse = waitForDomMessageResponse(
        "__LIT_DEV_TOOLS_SELECT_RESULT"
    );
    document.dispatchEvent(
        new CustomEvent("__LIT_DEV_TOOLS_SELECT_REQUEST", {
            detail: { index: index },
        })
    );
    selectResponse.then((res) => {
        console.log(res.detail);
        port.postMessage({ type: MESSAGE_TYPE.SELECT_RESULT, data: res.detail });
    });
}

/**
 * @param {string} eventName
 */
function waitForDomMessageResponse(eventName) {
    return new Promise((resolve, reject) => {
        document.addEventListener(
            eventName,
            (e) => {
                resolve(e);
            },
            { once: true }
        );
    });
}

