import { isInitMessage } from "@src/pages/messages/init-message";

export function handleContentMessageFromInPage(message: any): Promise<any> {
    const data = message.data;

    if (isInitMessage(data)) {
        console.log("CONTENT GOT INIT FROM INPAGE", message);
    }

    return Promise.resolve();
}
