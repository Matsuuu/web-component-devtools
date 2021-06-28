import { DOM_CREATED_EVENT, SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS } from "./crawler-constants";

export function spyEvents(targetElement, events) {
    disconnectEventListenersFromSelected();
    events?.forEach(event => {
        const triggerEvent = () => {
            const eventData = {
                detail: {
                    action: "EVENT",
                    eventData: {
                        event
                    }
                }
            };
            document.dispatchEvent(new CustomEvent(DOM_CREATED_EVENT, eventData));
        }
        targetElement.addEventListener(event.name, triggerEvent);
        addSelectedElementEventListenerDisconnecter(() => targetElement.removeEventListener(event.name, triggerEvent));
    });
}


function disconnectEventListenersFromSelected() {
    if (!window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS]) return;

    window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS].forEach(disc => disc());
    window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS] = [];
}

function addSelectedElementEventListenerDisconnecter(disconnecter) {
    if (!window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS]) {
        window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS] = [];
    }
    window[SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS].push(disconnecter);
}

export const eventObserversInject = `
${spyEvents.toString()}
${disconnectEventListenersFromSelected.toString()}
${addSelectedElementEventListenerDisconnecter.toString()}
`;
