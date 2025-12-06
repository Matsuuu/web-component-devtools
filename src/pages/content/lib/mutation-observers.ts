import { debounce } from "../../../lib/utils/debounce";
import { SPOTLIGHT_ELEM_ID } from "./spotlight/spotlight-element";
import { updateTree } from "../../../pages/inpage/events/update-tree";

const debouncedTreeUpdater = debounce(updateTree, 250);

export function initializeMutationObservers(element: Element | ShadowRoot = document.body) {
    setObserver(element);

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);

    while (walker.nextNode()) {
        const node = walker.currentNode;

        if (node instanceof Element) {
            if (node.id === SPOTLIGHT_ELEM_ID) {
                continue;
            }
            if (node.shadowRoot) {
                initializeMutationObservers(node.shadowRoot);
            }
        }
    }
}

function setObserver(element: Element | ShadowRoot) {
    const config = { attributes: true, childList: true, subtree: true };

    const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
        for (const mutation of mutations) {
            const target = mutation.target;
            if (target instanceof Element && target.id === SPOTLIGHT_ELEM_ID) {
                return;
            }
            if (mutation.type === "childList") {
                debouncedTreeUpdater();
            } else if (mutation.type === "attributes") {
                debouncedTreeUpdater();
            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(element, config);
    // TODO: Should we clean up at some point?
}
