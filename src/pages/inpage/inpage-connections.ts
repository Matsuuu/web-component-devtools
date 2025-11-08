import { isInitMessage } from "../messages/init-message";
import { LAYER, CONTEXT } from "../messages/layers";
import { MessageBase } from "../messages/message-base";
import { isSelectMessage } from "../messages/select-message";
import { updateTree } from "./events/update-tree";

export function initInpageConnections() {
    window.addEventListener("message", event => {
        const message = event.data;
        console.log({ message, event });
        if (event.source !== window) return; // only accept same-page messages
        if (message?.to !== LAYER.INPAGE) return;

        const data = message.data;

        if (isInitMessage(data)) {
            updateTree();
            return;
        }

        if (isSelectMessage(data)) {
            console.log("Asking for select");
            return;
        }
    });
}

export interface MessageFromInPageBase<T extends MessageBase> {
    to: (typeof LAYER)[keyof typeof LAYER];
    data: T;
}

export function sendMessageFromInPage<T extends MessageBase>(message: MessageFromInPageBase<T>) {
    window.postMessage({
        ...message,
        source: CONTEXT,
        from: LAYER.INPAGE,
    });
}
