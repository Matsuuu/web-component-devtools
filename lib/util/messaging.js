import { MESSAGE_TYPE } from "../types/message-types";

const messagingChannels = {};
let messagingChannel = null;

/**
 * @param {string} name
 * @param {{ (arg0: chrome.runtime.Port, arg1: any): void; }} [callback]
 */
export function sub(name, callback) {
    chrome.runtime.onConnect.addListener(function(port) {
        initMessagingChannel(name, port);
        port.onMessage.addListener(function(message) {
            callback(port, message);
        });
    });
}

/**
 * @param {string} name
 * @param {chrome.runtime.Port} channel
 */
export function initMessagingChannel(name, channel) {
    if (!messagingChannel) {
        messagingChannel = channel;
    }
    messagingChannels[name] = channel;
}

/**
 * @param {string | number | import("../types/message-types").DevToolsMessageType} name
 */
export function getMessagingChannel(name) {
    return messagingChannel;

    if (!messagingChannels[name])
        throw new Error(`Messaging channel not found ${name}`);

    return messagingChannels[name];
}

/**
 * @param {string} name
 * @param {any} message
 */
export function postMessage(name, message) {
    getMessagingChannel(name).postMessage(message);
}

/**
 * @param {string} name
 * @param {any} message
 * @param {any} [object]
 */
export function log(name, message, object) {
    if (object) {
        getMessagingChannel(name).postMessage({ type: MESSAGE_TYPE.LOG_OBJECT, log: `[LitDevTools@${name}]: ${message}`, data: object });
    } else {
        getMessagingChannel(name).postMessage({ type: MESSAGE_TYPE.LOG, log: `[LitDevTools@${name}]: ${message}` });
    }
}
