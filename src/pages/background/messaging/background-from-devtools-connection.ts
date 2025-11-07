import { isSelectMessage } from "@src/pages/messages/select-message";
import { queryElementDataFromWindow } from "../inject/user-window-inject";

export async function handleDevtoolsToBackgroundMessage(message: any, tabId: number) {
    const data = message.data;

    if (isSelectMessage(data)) {
        const staticElementData = await queryElementDataFromWindow(data.element.nodeName, tabId);
        console.log("staticElementData", staticElementData);
        // TODO: Get CEM info

        // TODO: We need to next communicate with content script to ask for the
        // actual properties and attributes of the class.
        //
        // TODO: We also want to access things like _attributeToPropertyMap and such
        // from things like LitElement
    }
}
