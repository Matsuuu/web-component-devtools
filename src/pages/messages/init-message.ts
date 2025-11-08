import { MessageBase } from "./message-base";

const MESSAGE_ID = "INIT";

export class InitMessage extends MessageBase {
    constructor(
        public tabId: number,
        public context?: string,
    ) {
        super(MESSAGE_ID);
    }
}

export function isInitMessage(message: any): message is InitMessage {
    return message.type === MESSAGE_ID;
}
