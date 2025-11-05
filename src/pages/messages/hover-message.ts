import { TreeElement } from "../content/lib/element";
import { MessageBase } from "./message-base";

const MESSAGE_ID = "HOVER_ELEMENT";

export class HoverMessage extends MessageBase {
    constructor(public element: TreeElement) {
        super(MESSAGE_ID);
    }
}

export function isHoverMessage(message: any): message is HoverMessage {
    return message.type === MESSAGE_ID;
}
