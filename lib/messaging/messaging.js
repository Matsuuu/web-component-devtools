

export function messagingTester(context) {
    console.log("Hello from ", context);
    console.table({
        "chrome.tabs": chrome.tabs,
        "chrome.runtime": chrome.runtime,
        "chrome.devtools": chrome.devtools,
    })
}


export const CONNECTION_HOSTS = {
    CONTENT: "CONTENT_SCRIPT",
    BACKGROUND: "BACKGROUND",
    DEVTOOLS: "DEVTOOLS"
};

class ConnectionPool {
    /**
     * @param {number} tabId
     */
    constructor(tabId) {
        /** @type { chrome.runtime.Port[] } */
        this.connections = [];
    }

    /**
        * @param { chrome.runtime.Port } connection
        * */
    addConnection(connection) {
        this.connections.push(connection);
    }

    /**
     * @param {string} name
     * @param {any} message
     */
    sendMessage(name, message) {
        this.connections.find(con => con.name === name).postMessage(message);
    }
}



/**
    * Hosting the router is done in the background worker as it's the longest living
    * process and it will work as our central hub for all communications.
    *
    * Every other part of the software will connect to this router, and have their messages
    * routed through it
    * */
export function hostRouter() {

    // number = tabId
    /** @type { Map<number, ConnectionPool>  } */
    const connections = new Map();

    chrome.runtime.onConnect.addListener(
        async (/** @type chrome.runtime.Port */ connection) => {
            console.log("Connection from " + connection.name, connection);

            connection.onMessage.addListener((message, port) => {
                if (message.type === "Handshake return") {
                    const tabId = message.tabId ?? port.sender.tab.id;
                    console.log("Handshake return. TabID: ", tabId);

                    if (!connections.get(tabId)) {
                        connections.set(tabId, new ConnectionPool(tabId));
                    }

                    connections.get(tabId).addConnection(port);
                }
            });

            connection.onDisconnect.addListener(() => {
                console.log("Connection " + connection.name + " disconnected.");
            });

            connection.postMessage({ type: "Handshake" });
        }
    );
}

/**
 * @param {string} connectionId
 */
export function connectToRouter(connectionId) {
    const connection = chrome.runtime.connect({
        name: connectionId,
    });

    connection.onMessage.addListener(async (message, port) => {
        console.log("On message from router ", { message, port });

        if (message.type === "Handshake") {
            const tabId = await tryGetTabId();
            connection.postMessage({ type: "Handshake return", tabId });
        }
    });

    window.__WC_DEV_TOOLS_ROUTER_CONNECTION = connection;
}

/**
 * @param {string} target
 * @param {any} message
 */
export function sendMessage(target, message) {
    const connection = window.__WC_DEV_TOOLS_ROUTER_CONNECTION;
    if (!connection) {
        console.warn("[WC Devtools]: Sendmessage Failed. No connection found for instance");
        return;
    }

    connection.postMessage({ target, data: message })
}

async function tryGetTabId() {
    let tabId = undefined;
    if (chrome.tabs) {
        const [tab] = await chrome.tabs?.query({ active: true });
        tabId = tab.id;
    }
    return tabId;
}
