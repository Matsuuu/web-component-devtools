import { MessageBase } from "./message-base";

const MESSAGE_ID = "REQUEST_INIT";

/**
 * Normally initialization is done by opening the devtools and it calling for init to content.
 *
 * Sometimes however, we have the devtools open and the content needs to start the init process.
 *
 * For these cases, we will ease the pain of rewiring things by just requesting the devtools
 * to start the init process.
 * */
export class RequestInitMessage extends MessageBase {
    constructor() {
        super(MESSAGE_ID);
    }
}

export function isRequestInitMessage(message: any): message is RequestInitMessage {
    return message.type === MESSAGE_ID;
}
