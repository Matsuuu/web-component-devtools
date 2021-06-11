/**
 * @typedef NydusOptions
 * @property {Array<NydusRequiredConnection>} requiredConnections
 * @property {NydusCallback} [onReady]
 * @property {NydusConnectCallback} [onConnect]
 * */

/**
 *   @callback NydusConnectCallback
 *   @param {Nydus} nydus
 *   @param {chrome.runtime.Port} connection
 * */

/**
 * @typedef NydusConnectionPool
 * @type Object.<string, NydusConnection>
 * */

/**
 * @typedef NydusConnection
 * @property {string | number} id
 * @property {chrome.runtime.Port} [connection]
 * @property {NYDUS_CONNECTION_ROLE} role
 * @property {boolean} ready
 * */

/**
 * @typedef NydusRequiredConnection
 * @property {string | number} id
 * @property {OnMessageCallback} [onMessage]
 * @property {boolean} host
 * @property {boolean} [ignoreTabs]
 * */

/**
 * @readonly
 * @enum {number} NydusConnectionRole
 * */
const NYDUS_CONNECTION_ROLE = {
    HOST: 0,
    CLIENT: 1,
};

const NYDUS_CONNECTION_HANDSHAKE = "NYDUS_CONNECTION_HANDSHAKE";

/**
 * @param {NydusOptions} nydusOptions
 *
 * @returns {Nydus} nydus;
 */
export function buildNydus(nydusOptions) {
    const nydus = new Nydus(nydusOptions);

    return nydus;
}

/**
 * @callback NydusCallback
 * @param {Nydus} nydus
 * */

/**
 * @callback OnMessageCallback
 * @param {any} message
 * */

/**
 *  A Routing / Orchestration tool for concurrent connections between dev tools closures
 * */
export class Nydus {
    /**
     * @param {NydusOptions} nydusOptions
     */
    constructor(nydusOptions) {
        /** @type {Array<NydusRequiredConnection>} */
        this.requiredConnections = nydusOptions.requiredConnections;
        /** @type {NydusCallback} */
        this.onReady = nydusOptions.onReady;
        /** @type {NydusConnectCallback} */
        this.onConnect = nydusOptions.onConnect;

        /** @type {NydusConnectionPool} connections */
        this.connections = {};
        /** @type {boolean} */
        this.ready = false;

        this._whenReadyResolver = null;
        this.whenReady = new Promise((resolve) => {
            this._whenReadyResolver = resolve;
        });

        this._needsToSpecifyTab = this._isDevtoolsComponent();

        this._createRequiredConnections();
    }

    _createRequiredConnections() {
        this.requiredConnections.forEach((requiredConnection) => {
            this.addConnection(
                requiredConnection.id,
                !requiredConnection.host,
                requiredConnection.onMessage,
                requiredConnection.ignoreTabs
            );
        });
    }

    /**
     * @param {number | string} connectionId
     * @param {boolean} isClient
     * @param {OnMessageCallback} onMessage
     * @param {boolean} ignoreTabs
     */
    addConnection(connectionId, isClient, onMessage, ignoreTabs = false) {
        if (this.connections[connectionId]) return; // No duplicates

        const nydusConnection = {
            id: connectionId,
            role: isClient
                ? NYDUS_CONNECTION_ROLE.CLIENT
                : NYDUS_CONNECTION_ROLE.HOST,
            ready: false,
        };

        this.connections[connectionId] = nydusConnection;
        this._doConnectionHandshake(nydusConnection, onMessage, ignoreTabs);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     * @param {boolean} ignoreTabs
     */
    addHostConnection(connectionId, onMessage, ignoreTabs = false) {
        this.addConnection(connectionId, false, onMessage, ignoreTabs);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     */
    addClientConnection(connectionId, onMessage) {
        this.addConnection(connectionId, true, onMessage, false);
    }

    /**
     * @param {string | number} connectionId
     * @param {{ (message: any, port: chrome.runtime.Port): void; (message: any, port: chrome.runtime.Port): void; }} callback
     */
    onMessage(connectionId, callback) {
        const conn = this.connections[connectionId].connection;
        if (!conn) return;

        conn.onMessage.addListener(callback);
        conn.onDisconnect.addListener(() => {
            conn.onMessage.removeListener(callback);
        });
    }

    /**
     * @param {string | number} recipient
     * @param {any} message
     */
    message(recipient, message) {
        const conn = this.connections[recipient]?.connection;
        if (!conn) return;
        conn.postMessage(message);
    }

    /**
     * @param {number} ms
     */
    _delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} ignoreTabs
     */
    _doConnectionHandshake(nydusConnection, onMessage, ignoreTabs) {
        if (nydusConnection.role === NYDUS_CONNECTION_ROLE.HOST) {
            this._doHostHandshake(nydusConnection, onMessage, ignoreTabs);
        } else {
            this._doClientHandshake(nydusConnection, onMessage);
        }
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} ignoreTabs
     */
    async _doHostHandshake(nydusConnection, onMessage, ignoreTabs) {
        await this._delay(2000);

        const connection = await this._createConnection(nydusConnection, ignoreTabs);
        nydusConnection.connection = connection;

        connection.onMessage.addListener(
            function finishHandshake(message) {
                this._handleConnectionHandshakeMessage(message);
                connection.onMessage.removeListener(finishHandshake);
                if (onMessage) {
                    connection.onMessage.addListener(onMessage);
                }
            }.bind(this)
        );
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {boolean} ignoreTabs
     */
    _createConnection(nydusConnection, ignoreTabs) {
        return new Promise((resolve, reject) => {
            // In devtools context we need to specify which tab to target
            if (this._needsToSpecifyTab && !ignoreTabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    let tabId;
                    if (tabs.length < 1) {
                        tabId = chrome.devtools.inspectedWindow.tabId;
                    } else {
                        tabId = tabs[0].id;
                    }
                    const connection = chrome.tabs.connect(tabId, {
                        name: nydusConnection.id.toString(),
                    });
                    resolve(connection);
                });
            } else {
                const connection = chrome.runtime.connect({
                    name: nydusConnection.id.toString(),
                });
                connection.onDisconnect.addListener(() => {
                    delete this.connections[nydusConnection.id.toString()];
                });
                resolve(connection);
            }
        });
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     */
    _doClientHandshake(nydusConnection, onMessage) {
        // TODO(Matsuuu): Check that the connection is the right one
        chrome.runtime.onConnect.addListener(
            function startHandshake(connection) {
                if (connection.name !== nydusConnection.id) return;
                this._handleClientHandshake(connection);

                if (onMessage) {
                    connection.onMessage.addListener(onMessage);
                }
                connection.onDisconnect.addListener(() => {
                    delete this.connections[nydusConnection.id.toString()]?.connection;
                });
            }.bind(this)
        );
    }

    _isDevtoolsComponent() {
        return typeof chrome.tabs !== "undefined";
    }

    /**
     * @param {{ type: string; id: any; }} message
     */
    _handleConnectionHandshakeMessage(message) {
        if (message.type !== NYDUS_CONNECTION_HANDSHAKE) return;

        const connectionId = message.id;
        const connectionInstance = this.connections[connectionId];
        connectionInstance.ready = true;
        this._doOnConnect(connectionInstance.connection);

        this._readyCheck();
    }

    /**
     * @param {chrome.runtime.Port} connection
     */
    _handleClientHandshake(connection) {
        const nydusConnection = this.connections[connection.name];
        nydusConnection.connection = connection;
        nydusConnection.ready = true;
        this._sendHandshake(nydusConnection.id);
        this._doOnConnect(connection);
        this._readyCheck();
    }

    /**
     * @param {chrome.runtime.Port} connection
     */
    _doOnConnect(connection) {
        if (this.onConnect) {
            this.onConnect(this, connection);
        }
    }

    /**
     * @param {string | number} connectionId
     */
    _sendHandshake(connectionId) {
        const connectionInstance = this.connections[connectionId];
        connectionInstance.connection?.postMessage({
            type: NYDUS_CONNECTION_HANDSHAKE,
            id: connectionInstance.id,
        });
    }

    _readyCheck() {
        if (this._requirementsFulfilled()) {
            this._whenReadyResolver(this);
            this._doOnReady();
        }
    }

    /**
     * Trigger onReady, and pass the nydus instance to it
     * */
    _doOnReady() {
        if (this.ready) return; // If already was ready, don't re-trigger

        this.ready = true;
        if (this.onReady) this.onReady(this);
    }

    _requirementsFulfilled() {
        let requirementsFulfilled = true;
        // Check that all required connections are built
        for (const conn of this.requiredConnections) {
            if (!this.connections[conn.id] || !this.connections[conn.id].ready) {
                requirementsFulfilled = false;
                break;
            }
        }

        return requirementsFulfilled;
    }
}
