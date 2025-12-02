import { MessageBase } from "./message-base";

const MESSAGE_ID = "HEARTBEAT";

export class HeartbeatMessage extends MessageBase {
    constructor(public tabId: number) {
        super(MESSAGE_ID);
    }
}

export function isHeartbeatMessage(message: any): message is HeartbeatMessage {
    return message.type === MESSAGE_ID;
}
