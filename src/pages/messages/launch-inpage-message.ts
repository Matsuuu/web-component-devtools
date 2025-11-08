import { MessageBase } from "./message-base";

const MESSAGE_ID = "LAUNCH_INPAGE";

export class LaunchInPageMessage extends MessageBase {
    constructor(public tabId: number) {
        super(MESSAGE_ID);
    }
}

export function isLaunchInPageMessage(message: any): message is LaunchInPageMessage {
    return message.type === MESSAGE_ID;
}
