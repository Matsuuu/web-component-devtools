import { DOM_EVENT_TRIGGERED, SELECTED_ELEMENT_EVENT_LISTENER_DISCONNECTERS } from './crawler-constants';

export function spyEvents(targetElement, events) {
    disconnectEventListenersFromSelected();
    events?.forEach(event => {
        const triggerEvent = () => {
            const eventData = {
                messageType: DOM_EVENT_TRIGGERED,
                eventData: {
                    event,
                },
            };
            window.postMessage(eventData, window.location.origin);
        };
        targetElement?.addEventListener(event.name, triggerEvent);
        addSelectedElementEventListenerDisconnecter(() => targetElement?.removeEventListener(event.name, triggerEvent));
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
