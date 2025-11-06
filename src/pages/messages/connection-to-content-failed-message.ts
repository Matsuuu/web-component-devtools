import { MessageBase } from "./message-base";

const MESSAGE_ID = "CONNECTION_TO_CONTENT_FAILED";

export class ConnectionToContentFailedMessage extends MessageBase {
    constructor(public tabId: number) {
        super(MESSAGE_ID);
    }
}

export function isConnectionToContentFailedMessage(message: any): message is ConnectionToContentFailedMessage {
    return message.type === MESSAGE_ID;
}
