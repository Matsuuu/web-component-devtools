import { ELEMENT_INDEX, ELEMENT_SELECTED_INDEX, MUTATION_EVENT } from './crawler-constants';
import { getCurrentSelectedElement } from './crawler-utils';

let mutationListStack = [];

export function listenForMutations(targetNode, config, alwaysReSelect = false) {
    // TODO(Matsuuu): Clean this mess
    const observer = new MutationObserver((mutationList, observer) => {
        throttle(mutationList, () => handleMutationEvent(mutationList, observer, targetNode, config, alwaysReSelect);
    });

    observer.observe(targetNode, config);
    return () => observer.disconnect();
}

/**
 * @param {MutationRecord[]} mutationList
 * @param {MutationObserver} observer
 * @param {HTMLElement} targetNode
 * @param {any} config
 * @param {boolean} alwaysReSelect
 */
function handleMutationEvent(mutationList, observer, targetNode, config, alwaysReSelect) {
    const isRelevantQueryEvent = checkIfMutationIsRelevantQueryEvent(mutationListStack);
    if (isRelevantQueryEvent) {
        document.dispatchEvent(new CustomEvent(MUTATION_EVENT, { detail: { action: 'QUERY' } }));
    }

    const currentTarget = getCurrentSelectedElement();
    const isRelevantReSelectEvent = checkIfMutationIsRelevantReSelectEvent(mutationListStack, currentTarget);
    if (alwaysReSelect || isRelevantReSelectEvent) {
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
}

let throttling = false;

function throttle(mutationList, callback) {
    if (throttling) {
        mutationListStack = [...mutationListStack, ...mutationList];
        return;
    }
    mutationListStack = mutationList;
    throttling = true;
    setTimeout(() => {
        callback();
        throttling = false;
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
    if (mutationList.some(mut => mut.target === currentTarget)) {
        isRelevant = true;
    }

    return isRelevant;
}

export const mutationInject = `
let throttling = false;
let mutationListStack = [];
${listenForMutations.toString()}
${checkIfMutationIsRelevantQueryEvent.toString()}
${checkIfMutationIsRelevantReSelectEvent.toString()}
${throttle.toString()}
${handleMutationEvent.toString()}
`;
