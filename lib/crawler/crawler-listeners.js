import { HIGHLIGHT_ELEMENT, INSPECT_REQUEST, QUERY_REQUEST, SELECT_REQUEST, UPDATE_REQUEST } from "./crawler-constants";
import { highlightElement, inspectElement, queryElements, selectElement, updateElementProperty, updateLatestContextMenuHit } from "./dom-actions";

export function initDomQueryListener() {
    document.addEventListener(QUERY_REQUEST, queryElements);
    document.addEventListener(HIGHLIGHT_ELEMENT, (
    /** @type CustomEvent */ e
    ) => highlightElement(e.detail.index));
    document.addEventListener(SELECT_REQUEST, (
    /** @type CustomEvent */ e
    ) => selectElement(e.detail.index));

    document.addEventListener(UPDATE_REQUEST, (
    /** @type CustomEvent */ e
    ) => updateElementProperty(e.detail));

    document.addEventListener("contextmenu", (e) =>
        updateLatestContextMenuHit(e)
    );

    document.addEventListener(INSPECT_REQUEST, inspectElement);
}

export const crawlerListenersInject = `
${initDomQueryListener.toString()}
`;
