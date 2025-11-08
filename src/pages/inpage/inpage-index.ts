import { InitMessage, isInitMessage } from "../messages/init-message";
import { CONTEXT, LAYER } from "../messages/layers";

function initInPage() {
    window.addEventListener("message", event => {
        const message = event.data;
        if (event.source !== window) return; // only accept same-page messages
        if (message?.to !== LAYER.INPAGE) return;

        const data = message.data;

        if (isInitMessage(data)) {
            window.postMessage({
                source: CONTEXT,
                from: LAYER.INPAGE,
                to: LAYER.CONTENT,
                data: new InitMessage(data.tabId),
            });

            window.postMessage({
                source: CONTEXT,
                from: LAYER.INPAGE,
                to: LAYER.DEVTOOLS,
                data: new InitMessage(data.tabId),
            });
        }
    });
}

(() => {
    initInPage();
})();
