import {
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    QUERY_REQUEST,
    SELECT_REQUEST,
    START_SPY_EVENTS,
    UPDATE_ATTRIBUTE_REQUEST,
    UPDATE_PROPERTY_REQUEST,
} from './crawler-constants';
import {
    callFunction,
    highlightElement,
    inspectElement,
    queryElements,
    selectElement,
    startSpyEvents,
    updateElementAttribute,
    updateElementProperty,
    updateLatestContextMenuHit,
} from './dom-actions';

export function initDomQueryListener() {
    window.addEventListener("message", (msg) => {
        switch (msg.data.messageType) {
            case HIGHLIGHT_ELEMENT:
                highlightElement(msg.data.index);
                break;
            case QUERY_REQUEST:
                queryElements();
                break;
            case SELECT_REQUEST:
                selectElement(msg.data);
                break;
            case UPDATE_PROPERTY_REQUEST:
                updateElementProperty(msg.data);
                break;
            case UPDATE_ATTRIBUTE_REQUEST:
                updateElementAttribute(msg.data);
                break;
            case INSPECT_REQUEST:
                inspectElement();
                break;
            case FUNCTION_CALL_REQUEST:
                callFunction(msg.data);
                break;
            case START_SPY_EVENTS:
                startSpyEvents(msg.data);
                break;
        }
    })
    document.addEventListener('contextmenu', e => updateLatestContextMenuHit(e));
}

export const crawlerListenersInject = `
${initDomQueryListener.toString()}
`;
