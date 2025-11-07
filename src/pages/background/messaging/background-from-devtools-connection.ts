import { isSelectMessage } from "@src/pages/messages/select-message";
import { queryElementDataFromWindow, queryElementDomData } from "../inject/user-window-inject";
import browser from "webextension-polyfill";
import { LAYER } from "@src/pages/messages/layers";

export async function handleDevtoolsToBackgroundMessage(message: any, tabId: number) {
    const data = message.data;

    if (isSelectMessage(data)) {
        const staticAnalyzedElement = await queryElementDataFromWindow(data.element.nodeName, tabId);
        console.log("staticAnalyzedElement", staticAnalyzedElement);

        // TODO: At this point we are shooting a message to the Content-level, which means that
        // we are going to acquire some values for props and attributes.
        //
        // When we have analyzer in place, the analyzation should be done before this step so that
        // we know all of the properties and attributes we want to get values for.
        const domAnalyzedElement = await queryElementDomData(data.element, tabId);

        console.log("domAnalyzedElement", domAnalyzedElement);

        // TODO: Get CEM info

        // TODO: We need to next communicate with content script to ask for the
        // actual properties and attributes of the class.
        //
        // TODO: We also want to access things like _attributeToPropertyMap and such
        // from things like LitElement
    }
}
