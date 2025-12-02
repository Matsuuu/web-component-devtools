import { TreeElement } from "@src/pages/content/lib/element";
import { LAYER } from "@src/pages/messages/layers";
import { devtoolsState } from "../state/devtools-context";
import { SelectMessage } from "@src/pages/messages/select-message";

export function createDevtoolsSelectEvent(element: TreeElement) {
    devtoolsState.messagePort.postMessage({
        from: LAYER.DEVTOOLS,
        to: LAYER.INPAGE,
        data: new SelectMessage(element),
    });
}
