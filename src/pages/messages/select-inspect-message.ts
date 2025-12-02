import { MessageBase } from "./message-base";

const MESSAGE_ID = "SELECT_INSPECT_ELEMENT";

export class SelectInspectMessage extends MessageBase {
    constructor() {
        super(MESSAGE_ID);
    }
}

export function isSelectInspectMessage(message: any): message is SelectInspectMessage {
    return message.type === MESSAGE_ID;
}
