import {
    Attributes,
    DomAnalyzedElement,
    Properties,
    Property,
    PropertyType,
    SerializedProperties,
    SerializedProperty,
    StaticAnalyzedElement,
} from "@src/lib/analyzer/analyzed-element";
import { getSpotlightElementDimensions } from "../content/lib/spotlight/dimensions";
import { moveSpotlight, requestSpotlightRemove } from "../content/lib/spotlight/spotlight-element";
import { contentTreeState } from "../content/lib/tree-walker";
import { isHoverLeaveMessage } from "../messages/hover-leave-message";
import { isHoverMessage } from "../messages/hover-message";
import { isInitMessage } from "../messages/init-message";
import { LAYER, CONTEXT } from "../messages/layers";
import { MessageBase } from "../messages/message-base";
import { isPingMessage, PingMessage } from "../messages/ping-message";
import { isSelectInspectMessage } from "../messages/select-inspect-message";
import { isSelectMessage } from "../messages/select-message";
import { analyzeSelectedElement } from "./analyzer/custom-element-dom-analyzer";
import { updateTree } from "./events/update-tree";
import { inpageState } from "./inpage-state";
import { analyzeStaticAnalyzedElementAgainstDOM } from "./analyzer/dom-element-analyzer";
import { TreeElement } from "../content/lib/element";
import { SelectResultMessage } from "../messages/select-result-message";
import { SerializedAnalyzedElement } from "./analyzer/serialized-analyzed-element";

export function initInpageConnections() {
    window.addEventListener("message", event => {
        const message = event.data;
        if (event.source !== window) return; // only accept same-page messages
        if (message?.to !== LAYER.INPAGE) return;

        const data = message.data;

        if (isInitMessage(data)) {
            updateTree();
            return;
        }

        if (isSelectMessage(data)) {
            console.log("[NOT IMPLEMENTED]: Asking for select");
            const treeElement = contentTreeState.treeElementByIdMap.get(data.element.id);
            if (!treeElement) {
                return;
            }

            const analyzedElement = analyzeTreeElement(treeElement);
            console.log(analyzedElement);
            sendMessageFromInPage({
                to: LAYER.DEVTOOLS,
                data: new SelectResultMessage(analyzedElement),
            });
            return;
        }

        if (isSelectInspectMessage(data)) {
            const inspectedElement = inpageState.previousContextMenuTarget;
            if (!inspectedElement) {
                return;
            }
            const treeElement = contentTreeState.treeElementWeakMap.get(inspectedElement);
            if (!treeElement) {
                return;
            }

            const analyzedElement = analyzeTreeElement(treeElement);
            console.log(analyzedElement);
            sendMessageFromInPage({
                to: LAYER.DEVTOOLS,
                data: new SelectResultMessage(analyzedElement, true),
            });
            return;
        }

        if (isHoverMessage(data)) {
            const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
            if (!hoveredElement) {
                return;
            }

            const dimensions = getSpotlightElementDimensions(hoveredElement);

            moveSpotlight(dimensions);

            return;
        }

        if (isHoverLeaveMessage(data)) {
            requestSpotlightRemove();

            return;
        }

        if (isPingMessage(data)) {
            sendMessageFromInPage({
                to: LAYER.DEVTOOLS,
                data: new PingMessage(),
            });
        }
    });
}

function analyzeTreeElement(treeElement: TreeElement): SerializedAnalyzedElement {
    const staticAnalyzedElement = analyzeSelectedElement(treeElement);
    const domAnalyzedElement = analyzeStaticAnalyzedElementAgainstDOM(staticAnalyzedElement, treeElement);
    return new SerializedAnalyzedElement(domAnalyzedElement);
}

export interface MessageFromInPageBase<T extends MessageBase> {
    to: (typeof LAYER)[keyof typeof LAYER];
    data: T;
}

export function sendMessageFromInPage<T extends MessageBase>(message: MessageFromInPageBase<T>) {
    window.postMessage({
        ...message,
        source: CONTEXT,
        from: LAYER.INPAGE,
    });
}
