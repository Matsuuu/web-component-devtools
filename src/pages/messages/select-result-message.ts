import { DomAnalyzedElement } from "@src/lib/analyzer/analyzed-element";
import { MessageBase } from "./message-base";

const MESSAGE_ID = "SELECT_RESULT_ELEMENT";

export class SelectResultMessage extends MessageBase {
    constructor(
        public element: DomAnalyzedElement,
        public focusOnDevtools = false,
    ) {
        super(MESSAGE_ID);
    }
}

export function isSelectResultMessage(message: any): message is SelectResultMessage {
    return message.type === MESSAGE_ID;
}
