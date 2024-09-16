export function messagingTester(context) {
    console.table({
        "chrome.tabs": chrome.tabs,
        "chrome.runtime": chrome.runtime,
        "chrome.devtools": chrome.devtools,
    });
}

export const CONNECTION_HOSTS = {
    CONTENT: "CONTENT_SCRIPT",
    BACKGROUND: "BACKGROUND",
    DEVTOOLS: "DEVTOOLS",
};

class ConnectionPool {
    constructor() {
        /** @type { Connection[] } */
        this.connections = [];
    }

    /**
     * @param { number } tabId
     * @param { chrome.runtime.Port } port
     * */
    addConnection(tabId, port) {
        // Remove existing, dangling
        const cleanedPool = this.connections.filter(con => con.tabId !== tabId || con.name !== port.name);
        cleanedPool.push(new Connection(port, tabId));

        this.connections = cleanedPool;
    }

    /**
     * @param {number} tabId
     * @param {string} name
     * @param {any} message
     */
    sendMessage(tabId, name, message) {
        const targetConnection = this.connections.find(con => con.tabId === tabId && con.name === name);
        if (!targetConnection) {
            console.debug("Could not find recipient for message ", message);
            return;
        }
        console.log("Sending message to " + name + " running on tab " + tabId, message);
        targetConnection.port.postMessage({ target: name, data: message });
    }

    /**
     * @param { chrome.runtime.Port } port
     * */
    findConnection(port) {
        return this.connections.find(con => con.hosts(port));
    }
}

const pool = new ConnectionPool();

class Connection {
    /**
     * @param {chrome.runtime.Port} port
     * @param {any} tabId
     */
    constructor(port, tabId) {
        this.port = port;
        this.tabId = tabId;
    }

    get name() {
        return this.port.name;
    }

    /**
     * @param {chrome.runtime.Port} port
     */
    hosts(port) {
        return this.port === port;
    }
}

/**
 * Hosting the router is done in the background worker as it's the longest living
 * process and it will work as our central hub for all communications.
 *
 * Every other part of the software will connect to this router, and have their messages
 * routed through it
 * */
export function hostRouter(onMessage) {
    globalThis.__WC_DEV_TOOLS_CONNECTOR_ID = CONNECTION_HOSTS.BACKGROUND;

    chrome.runtime.onConnect.addListener(async (/** @type chrome.runtime.Port */ connection) => {
        console.log("Connection from " + connection.name, connection);

        connection.onMessage.addListener((message, port) => {
            console.log("Router got message from ", { message, port });
            onRouterMessage(message, port, onMessage);
        });

        connection.onDisconnect.addListener(() => {
            console.log("Connection " + connection.name + " disconnected.");
        });

        sendMessage(connection.name, new HandshakeMessage(), connection);
    });
}

export function messageIs(message, clazz) {
    if (!message || !clazz) {
        return false;
    }
    return message.type === new clazz({}).type;
}

export class HandshakeMessage {
    type = "Handshake";
}

export class HandshakeResponseMessage {
    type = "HandshakeResponse";

    /**
     * @param {{ tabId: number }} tabId
     * */
    constructor({ tabId }) {
        this.tabId = tabId;
    }
}

/**
 * @param {{target: string, data: any}} message
 * @param {chrome.runtime.Port} port
 */
function onRouterMessage({ target, data: message }, port, onMessage) {
    if (target === CONNECTION_HOSTS.BACKGROUND) {
        handleRouterMessage(target, message, port, onMessage);
    } else {
        bridgeMessage(target, message, port);
    }
}

/**
 * @param {string} target
 * @param {{ tabId: number; }} message
 * @param {chrome.runtime.Port} port
 */
function handleRouterMessage(target, message, port, onMessage) {
    if (messageIs(message, HandshakeResponseMessage)) {
        const response = new HandshakeResponseMessage(message);

        const tabId = response.tabId ?? port.sender.tab.id;

        pool.addConnection(tabId, port);
        return;
    }
    onMessage(message, port);
}

/**
 * @param {string} target
 * @param {any} message
 * @param {chrome.runtime.Port} port
 */
function bridgeMessage(target, message, port) {
    const currentConnection = pool.findConnection(port);
    if (!currentConnection) {
        return;
    }
    const currentTab = currentConnection.tabId;

    console.log("Resolved connection ", { currentConnection, port });
    pool.sendMessage(currentTab, target, message);
}

/**
 * @param {string} connectionId
 * @param {Function} onMessageListener
 */
export function connectToRouter(connectionId, onMessageListener) {
    globalThis.__WC_DEV_TOOLS_CONNECTOR_ID = connectionId;

    const connection = chrome.runtime.connect({
        name: connectionId,
    });

    connection.onMessage.addListener(async ({ data: message }, port) => {
        if (messageIs(message, HandshakeMessage)) {
            const tabId = await tryGetTabId();
            sendMessage(CONNECTION_HOSTS.BACKGROUND, new HandshakeResponseMessage({ tabId }));
            onMessageListener(message, port);
        } else {
            onMessageListener(message, port);
        }
    });

    globalThis.__WC_DEV_TOOLS_ROUTER_CONNECTION = connection;
}

/**
 * @param {string} target
 * @param {any} message
 * @param {chrome.runtime.Port} [port]
 */
export function sendMessage(target, message, port) {
    console.log(
        `[WC Devtools - ${(port ?? globalThis.__WC_DEV_TOOLS_ROUTER_CONNECTION).name}]: Sending a message to ` + target,
        message,
    );
    /** @type { chrome.runtime.Port } */
    const connection = port ?? globalThis.__WC_DEV_TOOLS_ROUTER_CONNECTION;

    if (!connection) {
        console.error("[WC Devtools]: Sendmessage Failed. No connection found for instance " + getConnectionName());
        return;
    }

    connection.postMessage({ target, data: message });
}

/**
 * @param {string} target
 * @param {any} message
 * @param {any} resultType
 * @param {chrome.runtime.Port} [port]
 */
export function sendMessageAndAwaitResponse(target, message, resultType, port) {
    return new Promise((resolve, reject) => {
        /** @type { chrome.runtime.Port } */
        const connection = port ?? globalThis.__WC_DEV_TOOLS_ROUTER_CONNECTION;

        if (!connection) {
            console.error("[WC Devtools]: Sendmessage Failed. No connection found for instance " + getConnectionName());
            return;
        }

        const onResponse = (/** @type {any} */ responseMessage) => {
            if (messageIs(responseMessage, resultType)) {
                connection.onMessage.removeListener(onResponse);
                resolve(responseMessage);
            }
        };

        connection.onMessage.addListener(onResponse);
        sendMessage(target, message, port);
    });
}

async function tryGetTabId() {
    let tabId = undefined;
    if (chrome.tabs) {
        const [tab] = await chrome.tabs?.query({ active: true, lastFocusedWindow: true });
        tabId = tab.id;
    }
    return tabId;
}

function getConnectionName() {
    return globalThis.__WC_DEV_TOOLS_CONNECTOR_ID;
}

export class PongMessage {
    type = "Pong";
}
export class PingMessage {
    type = "Ping";
}
