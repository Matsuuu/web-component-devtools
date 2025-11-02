export interface InitMessage {
    type: "INIT";
    tabId: number;
}

export function initMessage(tabId: number): InitMessage {
    return {
        type: "INIT",
        tabId,
    };
}

export function isInitMessage(message: any): message is InitMessage {
    return message.type === "INIT";
}
