import { ELEMENT_INDEX, ELEMENT_SELECTED_INDEX, MUTATION_EVENT } from './crawler-constants';
import { getCurrentSelectedElement } from './crawler-utils';

export function listenForMutations(targetNode, alwaysReSelect = false) {
    const config = { attributes: true, childList: true, subtree: true };

    // TODO(Matsuuu): Clean this mess
    const observer = new MutationObserver((mutationList, observer) => {
        throttle(() => {
            const isRelevantQueryEvent = checkIfMutationIsRelevantQueryEvent(mutationList);
            if (isRelevantQueryEvent) {
                document.dispatchEvent(new CustomEvent(MUTATION_EVENT, { detail: { action: 'QUERY' } }));
            }

            const currentTarget = getCurrentSelectedElement();
            const isRelevantReSelectEvent = checkIfMutationIsRelevantReSelectEvent(mutationList, currentTarget);
            if (alwaysReSelect || isRelevantReSelectEvent) {
                document.dispatchEvent(
                    new CustomEvent(MUTATION_EVENT, {
                        detail: {
                            action: 'RESELECT',
                            target: {
                                indexInDevTools: currentTarget[ELEMENT_INDEX],
                                name: currentTarget.nodeName.toLowerCase(),
                                tagName: currentTarget.nodeName.toLowerCase(),
                            },
                        },
                    }),
                );
            }
        });
    });

    observer.observe(targetNode, config);
    return () => observer.disconnect();
}

let throttling = false;

// This might ignore some of the mutated items. See if it proves to be an issue
function throttle(callback) {
    if (throttling) return;
    throttling = true;
    setTimeout(() => {
        callback();
        throttling = false;
    }, 100);
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
${listenForMutations.toString()}
${checkIfMutationIsRelevantQueryEvent.toString()}
${checkIfMutationIsRelevantReSelectEvent.toString()}
${throttle.toString()}
`;
