import { MESSAGE_TYPE } from "../types/message-types";

let messagingChannel = null;

/**
 * @param {{ (arg0: chrome.runtime.Port, arg1: any): void; }} [callback]
 */
export function subMessageChannel(callback) {
    chrome.runtime.onConnect.addListener(function(port) {
        initMessagingChannel(port);
        port.onMessage.addListener(function(message) {
            callback(port, message);
        });
    });
}

/**
 * @param {chrome.runtime.Port} channel
 */
export function initMessagingChannel(channel) {
    if (!messagingChannel) {
        messagingChannel = channel;
    }
    return messagingChannel;
}

export function getMessagingChannel() {
    return messagingChannel;
}

/**
 * @param {any} message
 */
export function postMessage(message) {
    getMessagingChannel().postMessage(message);
}

/**
 * @param {string} name
 * @param {any} message
 * @param {any} [object]
 */
export function log(name, message, object) {
    if (object) {
        getMessagingChannel().postMessage({ type: MESSAGE_TYPE.LOG_OBJECT, log: `[LitDevTools@${name}]: ${message}`, data: object });
    } else {
        getMessagingChannel().postMessage({ type: MESSAGE_TYPE.LOG, log: `[LitDevTools@${name}]: ${message}` });
    }
}
