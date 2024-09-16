import { MUTATOR_RE_QUERY, MUTATOR_RE_SELECT, SELECTED_ELEMENT_OBSERVER_DISCONNECTERS } from "./crawler-constants";
import { elementHasShadowRoot, getCurrentSelectedElement, getCurrentSelectedElementNode } from "./crawler-utils";

// TODO's here:
// Clean up the whole process a bit.
// Make try to minimize the callbacks
// Adjust throttling if needed

let mutationListStack = [];

export function handleSelectMutationObservers(selectedElement) {
    disconnectObserversFromSelected();

    const mutatorConfig = { childList: true, subtree: true, attributes: true, characterData: true };
    if (selectedElement?.shadowRoot) {
        addSelectedElementObserverDisconnecter(listenForMutations(selectedElement.shadowRoot, mutatorConfig, true));
    }
    addSelectedElementObserverDisconnecter(listenForMutations(selectedElement, mutatorConfig, true));
}

export function disconnectObserversFromSelected() {
    if (!window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS]) return;

    window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS].forEach(disc => disc?.());
    window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS] = [];
}

export function addSelectedElementObserverDisconnecter(disconnecter) {
    if (!window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS]) {
        window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS] = [];
    }
    window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS].push(disconnecter);
}

/**
 * @param {Node} targetNode
 * @param {MutationObserverInit} config
 * @param {boolean} [alwaysReSelect]
 */
export function listenForMutations(targetNode, config, alwaysReSelect = false) {
    if (!targetNode) return;
    const observer = new MutationObserver((mutationList, observer) => {
        throttleMutationObserver(mutationList, () => handleMutationEvent(observer, false));
    });

    observer.observe(targetNode, config);
    return () => observer.disconnect();
}

/**
 * @param {MutationObserver} observer
 * @param {boolean} alwaysReQuery
 */
function handleMutationEvent(observer, alwaysReQuery) {
    const isRelevantMutation = checkIfMutationIsRelevant(mutationListStack);
    if (!isRelevantMutation) return;
    reQueryIfNeeded(alwaysReQuery);
    doReSelect();
}

/**
 * @param {boolean} alwaysReQuery
 */
function reQueryIfNeeded(alwaysReQuery) {
    if (alwaysReQuery) {
        window.postMessage({ messageType: MUTATOR_RE_QUERY }, window.location.origin);
    }
}

function doReSelect() {
    const currentTarget = getCurrentSelectedElement();
    const node = getCurrentSelectedElementNode();
    if (!currentTarget) return;

    const selectData = {
        messageType: MUTATOR_RE_SELECT,
        target: {
            node: {
                id: node.id,
                name: currentTarget.nodeName.toLowerCase(),
                tagName: currentTarget.nodeName.toLowerCase(),
            },
        },
    };
    window.postMessage(selectData, window.location.origin);
}

let throttlingMutationObserver = false;

function throttleMutationObserver(mutationList, callback) {
    if (throttlingMutationObserver) {
        mutationListStack = [...mutationListStack, ...mutationList];
        return;
    }
    mutationListStack = mutationList;
    throttlingMutationObserver = true;
    setTimeout(() => {
        callback();
        throttlingMutationObserver = false;
    }, 50);
}

function checkIfMutationIsRelevant(mutationList) {
    // Separate the mutations to attribute changes and DOM node changes
    const attributeMutations = [];
    const domChangeMutations = [];

    for (const mut of mutationList) {
        if (mut.target.nodeName === "WC-DEVTOOLS-SPOTLIGHT-BORDER") break; // Ignore elements we put into dom

        if (mut.type === "attributes") attributeMutations.push(mut);
        else domChangeMutations.push(mut);
    }

    // If not viable mutations happened, just exit early
    if (attributeMutations.length + domChangeMutations.length <= 0) {
        return false;
    }

    // If all of the updates are to attributes, and none of them affect the custom elements
    if (domChangeMutations.length <= 0 && !attributeMutations.some(mut => mut.target.nodeName.includes("-"))) {
        return false;
    }

    return true;
}

function checkIfMutationIsRelevantReSelectEvent(mutationList, currentTarget) {
    if (!currentTarget) return false;

    let isRelevant = false;
    if (
        mutationList.some(
            mut =>
                mut.target === currentTarget || (currentTarget.shadowRoot && mut.target === currentTarget.shadowRoot),
        )
    ) {
        isRelevant = true;
    }

    return isRelevant;
}

/**
 * @param {Element} [baseElement]
 * @param {MutationObserver} [observer]
 */
export function initDomMutationObservers(baseElement, observer) {
    if (!baseElement) {
        baseElement = document.body;
    }

    if (!observer) {
        observer = new MutationObserver((mutationList, observer) => {
            throttleMutationObserver(mutationList, () => handleMutationEvent(observer, true));
        });
    }

    const mutatorConfig = { childList: true, subtree: true, attributes: true };
    observer.observe(baseElement, mutatorConfig);
    if (baseElement.shadowRoot) {
        observer.observe(baseElement.shadowRoot, mutatorConfig);
        Array.from(baseElement.shadowRoot.querySelectorAll("*"))
            .filter(elementHasShadowRoot)
            .forEach(el => initDomMutationObservers(el, observer));
    }

    Array.from(baseElement.querySelectorAll("*"))
        .filter(elementHasShadowRoot)
        .forEach(el => initDomMutationObservers(el, observer));
}
