import { TreeElement } from "@src/pages/content/lib/element";
import { devtoolsState } from "../state/devtools-context";
import { LAYER } from "@src/pages/messages/layers";
import { HoverMessage } from "@src/pages/messages/hover-message";
import { HoverLeaveMessage } from "@src/pages/messages/hover-leave-message";

export function createDevtoolsHoverEvent(element: TreeElement) {
    devtoolsState.messagePort.postMessage({
        from: LAYER.DEVTOOLS,
        to: LAYER.INPAGE,
        data: new HoverMessage(element),
    });
}

export function createDevtoolsHoverLeaveEvent(element: TreeElement) {
    devtoolsState.messagePort.postMessage({
        from: LAYER.DEVTOOLS,
        to: LAYER.INPAGE,
        data: new HoverLeaveMessage(element),
    });
}
