import {
    FUNCTION_CALL_REQUEST,
    HIGHLIGHT_ELEMENT,
    INSPECT_REQUEST,
    QUERY_REQUEST,
    SELECT_REQUEST,
    UPDATE_ATTRIBUTE_REQUEST,
    UPDATE_PROPERTY_REQUEST,
} from './crawler-constants';
import {
    callFunction,
    highlightElement,
    inspectElement,
    queryElements,
    selectElement,
    updateElementAttribute,
    updateElementProperty,
    updateLatestContextMenuHit,
} from './dom-actions';

export function initDomQueryListener() {
    document.addEventListener(QUERY_REQUEST, queryElements);
    document.addEventListener(HIGHLIGHT_ELEMENT, (/** @type CustomEvent */ e) => highlightElement(e.detail.index));
    document.addEventListener(SELECT_REQUEST, (/** @type CustomEvent */ e) => selectElement(e.detail));

    document.addEventListener(UPDATE_PROPERTY_REQUEST, (/** @type CustomEvent */ e) => updateElementProperty(e.detail));

    document.addEventListener(UPDATE_ATTRIBUTE_REQUEST, (/** @type CustomEvent */ e) =>
        updateElementAttribute(e.detail),
    );

    document.addEventListener('contextmenu', e => updateLatestContextMenuHit(e));

    document.addEventListener(INSPECT_REQUEST, inspectElement);

    document.addEventListener(FUNCTION_CALL_REQUEST, callFunction);
}

export const crawlerListenersInject = `
${initDomQueryListener.toString()}
`;
