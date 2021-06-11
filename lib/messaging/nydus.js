/**
 * @typedef NydusOptions
 * @property {Array<string | number>} requiredConnections
 * @property {NydusCallback} [onBuild]
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
        /** @type {Array<any>} */
        this.requiredConnections = nydusOptions.requiredConnections;
        /** @type {NydusCallback} */
        this.onBuild = nydusOptions.onBuild;
        /** @type {NydusCallback} */
        this.onReady = nydusOptions.onReady;
        /** @type {NydusConnectCallback} */
        this.onConnect = nydusOptions.onConnect;

        /** @type {NydusConnectionPool} connections */
        this.connections = {};
        /** @type {boolean} */
        this.ready = false;

        if (this.onBuild) {
            this.onBuild(this);
        }

        this._whenReadyResolver = null;
        this.whenReady = new Promise((resolve) => {
            this._whenReadyResolver = resolve;
        });

        this._needsToSpecifyTab = this._isDevtoolsComponent();
    }

    /**
     * @param {number | string} connectionId
     * @param {boolean} isClient
        * @param {OnMessageCallback} onMessage
     */
    addConnection(connectionId, isClient, onMessage) {
        if (this.connections[connectionId]) return; // No duplicates

        const nydusConnection = {
            id: connectionId,
            role: isClient
                ? NYDUS_CONNECTION_ROLE.CLIENT
                : NYDUS_CONNECTION_ROLE.HOST,
            ready: false,
        };

        this.connections[connectionId] = nydusConnection;
        this._doConnectionHandshake(nydusConnection, onMessage);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     */
    addHostConnection(connectionId, onMessage) {
        this.addConnection(connectionId, false, onMessage);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     */
    addClientConnection(connectionId, onMessage) {
        this.addConnection(connectionId, true, onMessage);
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
     */
    _doConnectionHandshake(nydusConnection, onMessage) {
        if (nydusConnection.role === NYDUS_CONNECTION_ROLE.HOST) {
            this._doHostHandshake(nydusConnection, onMessage);
        } else {
            this._doClientHandshake(nydusConnection, onMessage);
        }
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     */
    async _doHostHandshake(nydusConnection, onMessage) {
        await this._delay(2000);

        const connection = await this._createConnection(nydusConnection);
        nydusConnection.connection = connection;

        connection.onMessage.addListener(
            function finishHandshake(message) {
                this._handleConnectionHandshakeMessage(message);
                connection.onMessage.removeListener(finishHandshake);
                connection.onMessage.addListener(onMessage);
            }.bind(this)
        );
    }

    /**
     * @param {NydusConnection} nydusConnection
     */
    _createConnection(nydusConnection) {
        return new Promise((resolve, reject) => {
            // In devtools context we need to specify which tab to target
            if (this._needsToSpecifyTab) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length < 1) return reject();
                    const tabId = tabs[0].id;
                    const connection = chrome.tabs.connect(tabId, { name: nydusConnection.id.toString() });
                    resolve(connection);
                })
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

                connection.onMessage.addListener(onMessage);
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
            this.onConnect(this, connection)
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
        for (const id of this.requiredConnections) {
            if (!this.connections[id]) {
                requirementsFulfilled = false;
                break;
            }
        }

        return requirementsFulfilled;
    }
}
