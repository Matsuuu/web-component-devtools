const MESSAGE_TYPE = {
    LOG: 0,
    INIT: 1,
    QUERY: 2
};

const port = chrome.runtime.connect({ name: "Lit Devtools" });

port.onMessage.addListener(function(message) {
    console.log("Message: ", message);
    switch (message.type) {
        case MESSAGE_TYPE.LOG:
            console.log(message.data);
            break;
        case MESSAGE_TYPE.INIT:

            break;
        case MESSAGE_TYPE.QUERY:
            console.log("Tab opened, please query");
            break;
    }
});

port.postMessage({ type: MESSAGE_TYPE.INIT });
