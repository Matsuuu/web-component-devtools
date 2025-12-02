import { TreeElement } from "../content/lib/element";
import { MessageBase } from "./message-base";

const MESSAGE_ID = "SELECT_ELEMENT";

export class SelectMessage extends MessageBase {
    constructor(public element: TreeElement) {
        super(MESSAGE_ID);
    }
}

export function isSelectMessage(message: any): message is SelectMessage {
    return message.type === MESSAGE_ID;
}
