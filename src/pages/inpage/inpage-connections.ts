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
import { isAttributeChangeMessage } from "../messages/attribute-change-message";
import { initializeMutationObservers } from "../content/lib/mutation-observers";
import { devtoolsState } from "../devtools/state/devtools-context";

export function initInpageConnections() {
    window.addEventListener("message", event => {
        const message = event.data;
        if (event.source !== window) return; // only accept same-page messages
        if (message?.to !== LAYER.INPAGE) return;

        const data = message.data;

        // TODO: Move the implementations to their own file or at least functions at some point

        if (isInitMessage(data)) {
            initializeMutationObservers();
            return updateTree();
        }

        if (isSelectMessage(data)) {
            return invokeSelect(data.element);
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

            return invokeSelect(treeElement, true);
        }

        if (isHoverMessage(data)) {
            const hoveredElement = contentTreeState.treeElementByIdMap.get(data.element.id);
            if (!hoveredElement) {
                return;
            }

            const dimensions = getSpotlightElementDimensions(hoveredElement);

            return moveSpotlight(dimensions);
        }

        if (isHoverLeaveMessage(data)) {
            return requestSpotlightRemove();
        }

        if (isAttributeChangeMessage(data)) {
            const target = inpageState.selectedElement;
            if (!target) {
                return;
            }

            const change = data.attributeChange;
            if (change.type === "boolean") {
                target.element.toggleAttribute(change.name, change.value);
            } else {
                target.element.setAttribute(change.name, change.value);
            }

            invokeSelect(target);
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

export function invokeReSelect() {
    const treeElement = inpageState.selectedElement;
    if (treeElement) {
        invokeSelect(treeElement);
    }
}

function invokeSelect(element: TreeElement, focusOnDevTools: boolean = false) {
    const treeElement = contentTreeState.treeElementByIdMap.get(element.id);
    if (!treeElement) {
        return;
    }

    // TODO: De-select should also send a message. I mean when you close the select window
    inpageState.selectedElement = treeElement;

    const analyzedElement = analyzeTreeElement(treeElement);
    sendMessageFromInPage({
        to: LAYER.DEVTOOLS,
        data: new SelectResultMessage(analyzedElement, focusOnDevTools),
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
