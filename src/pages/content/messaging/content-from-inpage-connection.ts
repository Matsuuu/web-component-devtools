import { isInitMessage } from "@src/pages/messages/init-message";

export function handleContentMessageFromInPage(message: any): Promise<any> {
    console.log("Message from inpage", event);
    const data = message.data;

    if (isInitMessage(data)) {
        console.log("CONTENT GOT INIT FROM InPAGE", message);
    }

    return Promise.resolve();
}
