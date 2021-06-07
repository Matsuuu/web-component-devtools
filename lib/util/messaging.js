import { MESSAGE_TYPE } from "../types/message-types";

/**
 * @param {any} message
 */
export async function postMessage(message) {
    document.dispatchEvent(new CustomEvent("__WC_DEV_TOOLS_POST_MESSAGE", { detail: message }));
}

/**
 * @param {string} name
 * @param {any} message
 * @param {any} [object]
 */
export async function log(name, message, object) {

    if (object) {
        document.dispatchEvent(new CustomEvent("__WC_DEV_TOOLS_LOG_OBJECT", {
            detail:
            {
                type: MESSAGE_TYPE.LOG_OBJECT,
                log: `[WCDevTools@${name}]: ${message}`,
                data: object,
            }
        }));
    } else {

        document.dispatchEvent(new CustomEvent("__WC_DEV_TOOLS_LOG", {
            detail:
            {
                type: MESSAGE_TYPE.LOG,
                log: `[WCDevTools@${name}]: ${message}`,
            }
        }));
    }
}
