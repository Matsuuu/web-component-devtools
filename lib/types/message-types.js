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
    type = "QueryMessage";
}

export class QueryResultMessage {
    type = "QueryResultMessage";

    constructor(queryData, reselectTarget) {
        this.queryData = queryData;
        this.reselectTarget = reselectTarget;
    }
}

export class HighlightMessage {
    type = "HighlightMessage";

    constructor({ id }) {
        this.id = id;
    }
}

export class SelectMessage {
    type = "SelectMessage";

    /**
     * @param {{ node: import("custom-element-tree").CustomElementNodeInMessageFormat; }} message
     */
    constructor(message) {
        /** @type { import('custom-element-tree').CustomElementNodeInMessageFormat } node */
        this.node = message.node;
    }
}

export class RefreshMessage {
    static type = "RefreshMessage";
    type = "RefreshMessage";

    constructor({ tabId, doReSelect, latestSelect }) {
        this.tabId = tabId;
        this.doReSelect = doReSelect;
        this.latestSelect = latestSelect;
    }
}

export class TriggerEventMessage {
    type = "TriggerEventMessage";
}

export class ConsoleActionMessage {
    type = "ConsoleActionMessage";

    /**
     * @type { string } code
     * */
    constructor({ code }) {
        this.code = code;
    }
}

export class ConsoleActionResultMessage {
    type = "ConsoleActionResultMessage";
}

export class ScrollIntoViewMessage {
    type = "ScrollIntoViewMessage";

    /**
     * @type { number } id
     * */
    constructor({ id }) {
        this.id = id;
    }
}

/**
 * @typedef CallFunctionParams
 * @property { number } targetIndex,
 * @property { string } method
 * @property { any[] } parameters
 * @property { string } tagName
 * */

export class CallFunctionMessage {
    type = "CallFunctionMessage";

    /**
     * @param { CallFunctionParams } params
     * */
    constructor({ targetIndex, method, parameters, tagName }) {
        this.targetIndex = targetIndex;
        this.method = method;
        this.parameters = parameters;
        this.tagName = tagName;
    }
}

/**
 * @typedef UpdateAttributeOrPropertyParams
 * @property { number } index
 * @property { string } value
 * @property { number } elementType
 * @property { string } attributeOrProperty
 * @property { string } propertyPath
 * */

export class UpdateAttributeMessage {
    type = "UpdateAttributeMessage";

    /**
     * @param { UpdateAttributeOrPropertyParams } param
     * */
    constructor({ index, value, elementType, attributeOrProperty, propertyPath }) {
        this.index = index;
        this.value = value;
        this.elementType = elementType;
        this.attributeOrProperty = attributeOrProperty;
        this.propertyPath = propertyPath;
    }
}

export class UpdatePropertyMessage {
    type = "UpdatePropertyMessage";

    /**
     * @param { UpdateAttributeOrPropertyParams } param
     * */
    constructor({ index, value, elementType, attributeOrProperty, propertyPath }) {
        this.index = index;
        this.value = value;
        this.elementType = elementType;
        this.attributeOrProperty = attributeOrProperty;
        this.propertyPath = propertyPath;
    }
}

/**
 * @typedef AnalyzeElementParams
 * @property { number } type
 * @property { import("./devtools-element").DevToolsElement } eventData
 * @property { any[] } pageSources
 * @property { string[] } pageInlineSources
 * @property { string } origin
 * @property { string } fullPath
 * */

export class AnalyzeElementMessage {
    type = "AnalyzeElementMessage";

    /**
     * @param { AnalyzeElementParams } param
     * */
    constructor({ eventData, pageSources, pageInlineSources, origin, fullPath }) {
        this.eventData = eventData;
        this.pageSources = pageSources;
        this.pageInlineSources = pageInlineSources;
        this.origin = origin;
        this.fullPath = fullPath;
    }
}

/**
 * @typedef AnalyzeElementResultParams
 * @property { any[] } attributes
 * @property { any[] } attributeValues
 * @property { string } declaration
 * @property { any[] } events
 * @property { any[] } methods
 * @property { string } name
 * @property { import("custom-element-tree").CustomElementNodeInMessageFormat } node
 * @property { any[] } properties
 * @property { any[] } propertyValues
 * @property { string } parentClass
 * @property { string } tagName
 * @property { boolean } scrollToTargetInDevTools
 * @property { number } typeInDevTools
 * */

export class AnalyzeElementResultMessage {
    type = "AnalyzeElementResultMessage";

    /**
     * @param {AnalyzeElementResultParams} analysisResult
     */
    constructor(analysisResult) {
        this.attributes = analysisResult.attributes;
        this.declaration = analysisResult.declaration;
        this.events = analysisResult.events;
        this.methods = analysisResult.methods;
        this.name = analysisResult.name;
        this.node = analysisResult.node;
        this.properties = analysisResult.properties;
        this.tagName = analysisResult.tagName;
    }
}

export class SelectResultMessage {
    static type = "SelectResultMessage";
    type = "SelectResultMessage";

    /**
     * @param {AnalyzeElementResultParams} analysisResult
     */
    constructor(analysisResult) {
        this.attributes = analysisResult.attributes;
        this.attributeValues = analysisResult.attributeValues;
        this.declaration = analysisResult.declaration;
        this.events = analysisResult.events;
        this.methods = analysisResult.methods;
        this.name = analysisResult.name;
        this.node = analysisResult.node;
        this.properties = analysisResult.properties;
        this.propertyValues = analysisResult.propertyValues;
        this.tagName = analysisResult.tagName;
        this.scrollToTargetInDevTools = analysisResult.scrollToTargetInDevTools;
        this.typeInDevTools = analysisResult.typeInDevTools;
    }
}
