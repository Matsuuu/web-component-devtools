import { MessageBase } from "./message-base";

const MESSAGE_ID = "SELECT_INSPECT_ELEMENT";

/**
 * SelectInspect is the action where the user has devoolts open and
 * uses the context menu to pick an element from the page. Akin to "right click + inspect".
 * */
export class SelectInspectMessage extends MessageBase {
    constructor() {
        super(MESSAGE_ID);
    }
}

export function isSelectInspectMessage(message: any): message is SelectInspectMessage {
    return message.type === MESSAGE_ID;
}
