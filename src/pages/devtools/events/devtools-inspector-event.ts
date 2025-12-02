import { LAYER } from "@src/pages/messages/layers";
import { devtoolsState } from "../state/devtools-context";
import { AttributeChangeMessage } from "@src/pages/messages/attribute-change-message";

export type AttributeChange =
    | { name: string; type: "boolean"; value: boolean } //
    | { name: string; type: "string"; value: string };

export function createDevtoolsAttributeChangeEvent(attributeChange: AttributeChange) {
    devtoolsState.messagePort.postMessage({
        from: LAYER.DEVTOOLS,
        to: LAYER.INPAGE,
        data: new AttributeChangeMessage(attributeChange),
    });
}
