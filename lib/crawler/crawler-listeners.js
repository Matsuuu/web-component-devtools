import {
    ANALYZE_REQUEST,
    CONSOLE_ACTION,
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    QUERY_REQUEST,
    SCROLL_INTO_VIEW,
    SELECT_REQUEST,
    START_SPY_EVENTS,
    UPDATE_ATTRIBUTE_REQUEST,
    UPDATE_PROPERTY_REQUEST,
} from './crawler-constants';
import {
    analyzeElement,
    callFunction,
    consoleAction,
    highlightElement,
    inspectElement,
    queryElements,
    scrollIntoView,
    selectElement,
    startSpyEvents,
    updateElementAttribute,
    updateElementProperty,
    updateLatestContextMenuHit,
} from './dom-actions';

// @ts-ignore
window.__WC_DEVTOOLS_INITIALIZED = true;

export function initDomQueryListener() {
    window.addEventListener('message', msg => {
        switch (msg.data.messageType) {
            case HIGHLIGHT_ELEMENT:
                highlightElement(msg.data.id);
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
            case SCROLL_INTO_VIEW:
                scrollIntoView(msg.data);
                break;
            case ANALYZE_REQUEST:
                analyzeElement(msg.data);
                break;
            case CONSOLE_ACTION:
                consoleAction(msg.data);
                break;
        }
    });
    document.addEventListener('contextmenu', e => updateLatestContextMenuHit(e));
    document.addEventListener('click', e => queryElements());
}
