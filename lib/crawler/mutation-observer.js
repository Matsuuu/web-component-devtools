import { ELEMENT_INDEX, MUTATION_EVENT, SELECTED_ELEMENT_OBSERVER_DISCONNECTERS } from './crawler-constants';
import { getCurrentSelectedElement } from './crawler-utils';

// TODO's here:
// Clean up the whole process a bit.
// Make try to minimize the callbacks
// Adjust throttling if needed

let mutationListStack = [];

export function handleSelectMutationObservers(selectedElement) {
    disconnectObserversFromSelected();

    const mutatorConfig = { childList: true, subtree: true, attributes: true, characterData: true };
    if (selectedElement.shadowRoot) {
        addSelectedElementObserverDisconnecter(listenForMutations(selectedElement.shadowRoot, mutatorConfig, true));
    }
    addSelectedElementObserverDisconnecter(listenForMutations(selectedElement, mutatorConfig, true));
}

export function disconnectObserversFromSelected() {
    if (!window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS]) return;

    window[SELECTED_ELEMENT_OBSERVER_DISCONNECTERS].forEach(disc => disc());
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
    reQueryIfNeeded(alwaysReQuery);
    doReSelect();
}

function reQueryIfNeeded(alwaysReQuery) {
    if (alwaysReQuery || checkIfMutationIsRelevantQueryEvent(mutationListStack)) {
        document.dispatchEvent(new CustomEvent(MUTATION_EVENT, { detail: { action: 'QUERY' } }));
    }
}

function doReSelect() {
    const currentTarget = getCurrentSelectedElement();
    if (!currentTarget) return;
    const eventData = {
        detail: {
            action: 'RESELECT',
            target: {
                indexInDevTools: currentTarget[ELEMENT_INDEX],
                name: currentTarget.nodeName.toLowerCase(),
                tagName: currentTarget.nodeName.toLowerCase(),
            },
        },
    };
    document.dispatchEvent(new CustomEvent(MUTATION_EVENT, eventData));
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

function checkIfMutationIsRelevantQueryEvent(mutationList) {
    let isRelevant = true;
    if (mutationList.every(mut => mut.target.nodeName === 'WC-DEVTOOLS-SPOTLIGHT-BORDER')) {
        isRelevant = false;
    }

    return isRelevant;
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
function initDomMutationObservers(baseElement, observer) {
    if (!baseElement) baseElement = document.body;

    if (!observer) {
        observer = new MutationObserver((mutationList, observer) => {
            throttleMutationObserver(mutationList, () => handleMutationEvent(observer, true));
        });
    }

    const mutatorConfig = { childList: true, subtree: true };
    observer.observe(baseElement, mutatorConfig);
    if (baseElement.shadowRoot) {
        observer.observe(baseElement.shadowRoot, mutatorConfig);
    }

    Array.from(baseElement.querySelectorAll('*'))
        .filter(el => el.shadowRoot)
        .forEach(el => initDomMutationObservers(el, observer));
}

export const mutationInject = `
let throttlingMutationObserver = false;
let mutationListStack = [];
${initDomMutationObservers.toString()}
${doReSelect.toString()}
${reQueryIfNeeded.toString()}
${listenForMutations.toString()}
${checkIfMutationIsRelevantQueryEvent.toString()}
${checkIfMutationIsRelevantReSelectEvent.toString()}
${throttleMutationObserver.toString()}
${handleMutationEvent.toString()}
${disconnectObserversFromSelected.toString()}
${addSelectedElementObserverDisconnecter.toString()}
${handleSelectMutationObservers.toString()}
`;
