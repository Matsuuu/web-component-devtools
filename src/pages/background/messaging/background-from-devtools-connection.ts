import { isSelectMessage } from "@src/pages/messages/select-message";
import { queryCustomElementClassCodeFromWindow } from "../inject/user-window-inject";

export async function handleDevtoolsToBackgroundMessage(message: any, tabId: number) {
    const data = message.data;

    if (isSelectMessage(data)) {
        const classCode = await queryCustomElementClassCodeFromWindow(data.element.nodeName, tabId);
        // TODO: Run analyzer on file

        // TODO: We need to next communicate with content script to ask for the
        // actual properties and attributes of the class.

        console.log(classCode);
    }
}
