import { MessageBase } from "./message-base";

const MESSAGE_ID = "PING_MESSAGE";

export class PingMessage extends MessageBase {
    constructor() {
        super(MESSAGE_ID);
    }
}

export function isPingMessage(message: any): message is PingMessage {
    return message.type === MESSAGE_ID;
}
