import { TreeElement } from "../content/lib/element";
import { MessageBase } from "./message-base";

const MESSAGE_ID = "ELEMENT_TREE";

export class ElementTreeMessage extends MessageBase {
    constructor(public tree: TreeElement) {
        super(MESSAGE_ID);
    }
}

export function isElementTreeMessage(message: any): message is ElementTreeMessage {
    return message.type === MESSAGE_ID;
}
