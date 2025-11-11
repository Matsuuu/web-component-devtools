import { InitMessage, isInitMessage } from "@src/pages/messages/init-message";
import { LAYER } from "@src/pages/messages/layers";
import browser from "webextension-polyfill";
import { contentConnectionsState } from "./content-connection";
import { isPingMessage, PingMessage } from "@src/pages/messages/ping-message";

export function handleContentMessageFromDevtools(message: any): Promise<any> {
    const data = message.data;

    /**
     * The INIT event of content level is one of the more important ones:
     *
     * The init is originated from the Devtools Panel, which will inform us about what
     * tab we are inhibiting and also work as a source of truth for a lot of our information.
     *
     * In our INIT flow, the devtools send us an INIT package, after which we inform both, the
     * devtools, as well as the Background scripts that we are ready to handle devtools actions.
     *
     * The InPage messaging is set up from within the background layer, which is done as they receive
     * our init payload.
     * */
    if (isInitMessage(data)) {
        contentConnectionsState.initialized = true;
        contentConnectionsState.tabId = data.tabId;

        browser.runtime.sendMessage({
            from: LAYER.CONTENT,
            to: LAYER.BACKGROUND,
            data: new InitMessage(data.tabId),
        });

        browser.runtime.sendMessage({
            from: LAYER.CONTENT,
            to: LAYER.DEVTOOLS,
            data: new InitMessage(data.tabId),
        });

        return Promise.resolve();
    }

    if (isPingMessage(data)) {
        browser.runtime.sendMessage({
            from: LAYER.CONTENT,
            to: LAYER.DEVTOOLS,
            data: new PingMessage(),
        });

        return Promise.resolve();
    }

    return Promise.resolve();
}
