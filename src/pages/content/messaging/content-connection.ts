import { CONTEXT, LAYER } from "@src/pages/messages/layers";
import { RequestInitMessage } from "@src/pages/messages/request-init-message";
import browser from "webextension-polyfill";
import { handleContentMessageFromDevtools } from "./content-from-devtools-connection";
import { handleContentMessageFromBackground } from "./content-from-background-connection";
import { handleContentMessageFromInPage } from "./content-from-inpage-connection";
import { log, LogLevel } from "@src/lib/logger/log";
import { isPingMessage } from "@src/pages/messages/ping-message";
import { isHoverMessage } from "@src/pages/messages/hover-message";
import { isHoverLeaveMessage } from "@src/pages/messages/hover-leave-message";

export const contentConnectionsState = {
    initialized: false,
    tabId: undefined as number | undefined,
};

function setDevtoolsMessageListeners() {
    browser.runtime.onMessage.addListener((message: any, sender: any) => {
        if (!isPingMessage(message.data) && !isHoverMessage(message.data) && !isHoverLeaveMessage(message.data)) {
            log(LogLevel.DEBUG, "Message in Content: ", message);
        }
        if (message.to === LAYER.INPAGE) {
            window.postMessage({
                source: CONTEXT,
                ...message,
            });
            return;
        }

        if (message.from === LAYER.DEVTOOLS) {
            return handleContentMessageFromDevtools(message);
        }

        if (message.from === LAYER.BACKGROUND) {
            return handleContentMessageFromBackground(message);
        }
    });
}

function setInPageMessageListeners() {
    window.addEventListener("message", event => {
        const message = event.data;

        if (event.source !== window) return;
        if (message?.source !== CONTEXT) return;
        if (message.to === LAYER.INPAGE) return;

        if (message.from === LAYER.INPAGE) {
            if (message.to === LAYER.CONTENT) {
                return handleContentMessageFromInPage(message);
            } else {
                browser.runtime.sendMessage(message);
            }
        }
    });
}

function requestInitIfNeeded() {
    if (!contentConnectionsState.initialized) {
        setTimeout(() => {
            browser.runtime.sendMessage({
                from: LAYER.CONTENT,
                to: LAYER.DEVTOOLS,
                data: new RequestInitMessage(),
            });
        }, 1000);
    }
}

export function initConnection() {
    setDevtoolsMessageListeners();
    setInPageMessageListeners();
    requestInitIfNeeded();
}
