import { LAYER } from "@src/pages/messages/layers";
import { RequestInitMessage } from "@src/pages/messages/request-init-message";
import browser from "webextension-polyfill";
import { handleContentMessageFromDevtools } from "./content-from-devtools-connection";

export const contentConnectionsState = {
    initialized: false,
    tabId: undefined as number | undefined,
};

export function initConnection() {
    browser.runtime.onMessage.addListener((message: any, sender: any) => {
        if (message.from === LAYER.DEVTOOLS) {
            handleContentMessageFromDevtools(message);
        }
    });

    setTimeout(() => {
        if (!contentConnectionsState.initialized) {
            browser.runtime.sendMessage({
                from: LAYER.CONTENT,
                to: LAYER.DEVTOOLS,
                data: new RequestInitMessage(),
            });
        }
    }, 1000);
}
