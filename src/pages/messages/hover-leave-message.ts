import { MessageBase } from "./message-base";

const MESSAGE_ID = "HOVER_LEAVE_ELEMENT";

export class HoverLeaveMessage extends MessageBase {
    constructor() {
        super(MESSAGE_ID);
    }
}

export function isHoverLeaveMessage(message: any): message is HoverLeaveMessage {
    return message.type === MESSAGE_ID;
}
