import { MessageBase } from "./message-base";

export class InitMessage extends MessageBase {
    constructor(public tabId: number) {
        super("INIT");
    }
}

export function isInitMessage(message: any): message is InitMessage {
    return message.type === "INIT";
}
