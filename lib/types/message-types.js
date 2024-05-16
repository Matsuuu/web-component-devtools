/**
 * @typedef {number} DevToolsMessageType
 * */

export const MESSAGE_TYPE = {
    LOG: 0,
    LOG_OBJECT: 1,
    INIT: 2,
    QUERY: 3,
    QUERY_RESULT: 4,
    HIGHLIGHT: 5,
    SELECT: 6,
    SELECT_RESULT: 7,
    REFRESH: 8,
    UPDATE_PROPERTY: 9,
    UPDATE_ATTRIBUTE: 10,
    PANEL_OPENED: 11,
    INSPECT: 12,
    CALL_FUNCTION: 13,
    TRIGGER_EVENT: 14,
    RESELECT: 15,
    MANIFEST_FETCH: 16,
    PANEL_CLOSED: 17,
    SCROLL_INTO_VIEW: 18,
    ANALYZE_ELEMENT: 19,
    ANALYZE_ELEMENT_RESULT: 20,
    CONSOLE_ACTION: 21,
    CONSOLE_ACTION_RESULT: 22,
};

export class QueryMessage {
    type = 'QueryMessage';
}

export class HighlightMessage {
    type = 'HighlightMessage';

    constructor({ id }) {
        this.id = id;
    }
}

export class SelectMessage {
    type = 'SelectMessage';

    /**
     * @param {{ node: import("custom-element-tree").CustomElementNodeInMessageFormat; }} message
     */
    constructor(message) {
        /** @type { import('custom-element-tree').CustomElementNodeInMessageFormat } node */
        this.node = message.node;
    }
}
