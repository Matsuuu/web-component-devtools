export function messagingTester(context) {
    console.log('Hello from ', context);
    console.table({
        'chrome.tabs': chrome.tabs,
        'chrome.runtime': chrome.runtime,
        'chrome.devtools': chrome.devtools,
    });
}

export const CONNECTION_HOSTS = {
    CONTENT: 'CONTENT_SCRIPT',
    BACKGROUND: 'BACKGROUND',
    DEVTOOLS: 'DEVTOOLS',
};

class ConnectionPool {
    /**
     * @param {number} tabId
     */
    constructor(tabId) {
        this.tabId = tabId;
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

/** @type { Map<number, ConnectionPool>  } */
const connections = new Map();

/**
 * Hosting the router is done in the background worker as it's the longest living
 * process and it will work as our central hub for all communications.
 *
 * Every other part of the software will connect to this router, and have their messages
 * routed through it
 * */
export function hostRouter() {
    // number = tabId

    chrome.runtime.onConnect.addListener(async (/** @type chrome.runtime.Port */ connection) => {
        console.log('Connection from ' + connection.name, connection);

        connection.onMessage.addListener((message, port) => {
            onRouterMessage(message, port);
        });

        connection.onDisconnect.addListener(() => {
            console.log('Connection ' + connection.name + ' disconnected.');
        });

        connection.postMessage(new HandshakeMessage());
    });
}

// TODO: This class stuff won't work. Stupid stuff. Need to just work with raw data I guess
// Or do some type cast things but w/e
//
export function messageIs(message, clazz) {
    if (!message || !clazz) {
        return false;
    }
    return message.type === new clazz({}).type;
}

class HandshakeMessage {
    type = 'Handshake';
}

class HandshakeResponseMessage {
    type = 'HandshakeResponse';

    /**
     * @param {{ tabId: number }} tabId
     * */
    constructor({ tabId }) {
        this.tabId = tabId;
    }
}

class HeartbeatMessage {
    type = 'Heartbeat';
}

/**
 * @param {{target: string, data: any}} message
 * @param {chrome.runtime.Port} port
 */
function onRouterMessage({ target, data: message }, port) {
    console.log('On router message ', { target, message });
    if (messageIs(message, HandshakeResponseMessage)) {
        const response = new HandshakeResponseMessage(message);

        const tabId = response.tabId ?? port.sender.tab.id;

        if (!connections.get(tabId)) {
            connections.set(tabId, new ConnectionPool(tabId));
        }

        connections.get(tabId).addConnection(port);
    }

    if (messageIs(message, HeartbeatMessage)) {
        console.log('Heartbeat from ' + port.name + ' to ' + target);
    }
}

/**
 * @param {string} connectionId
 */
export function connectToRouter(connectionId) {
    const connection = chrome.runtime.connect({
        name: connectionId,
    });

    connection.onMessage.addListener(async (message, port) => {
        console.log('On message from router ', { message, port });

        if (messageIs(message, HandshakeMessage)) {
            const tabId = await tryGetTabId();
            connection.postMessage(new HandshakeResponseMessage({ tabId }));
            console.log(message);

            setInterval(() => {
                const target =
                    connectionId === CONNECTION_HOSTS.DEVTOOLS ? CONNECTION_HOSTS.CONTENT : CONNECTION_HOSTS.DEVTOOLS;
                sendMessage(target, new HeartbeatMessage());
            }, 2000);
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
        console.warn('[WC Devtools]: Sendmessage Failed. No connection found for instance');
        return;
    }

    connection.postMessage({ target, data: message });
}

async function tryGetTabId() {
    let tabId = undefined;
    if (chrome.tabs) {
        const [tab] = await chrome.tabs?.query({ active: true });
        tabId = tab.id;
    }
    return tabId;
}
