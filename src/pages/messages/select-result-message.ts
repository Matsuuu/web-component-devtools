import { MessageBase } from "./message-base";
import { SerializedAnalyzedElement } from "../inpage/analyzer/serialized-analyzed-element";

const MESSAGE_ID = "SELECT_RESULT_ELEMENT";

export class SelectResultMessage extends MessageBase {
    constructor(
        public element: SerializedAnalyzedElement,
        public focusOnDevtools = false,
    ) {
        super(MESSAGE_ID);
    }
}

export function isSelectResultMessage(message: any): message is SelectResultMessage {
    return message.type === MESSAGE_ID;
}
