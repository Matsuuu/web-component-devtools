import { AttributeChange } from "../devtools/events/devtools-inspector-event";
import { MessageBase } from "./message-base";

const MESSAGE_ID = "ATTRIBUTE_CHANGE";

export class AttributeChangeMessage extends MessageBase {
    constructor(public attributeChange: AttributeChange) {
        super(MESSAGE_ID);
    }
}

export function isAttributeChangeMessage(message: any): message is AttributeChangeMessage {
    return message.type === MESSAGE_ID;
}
