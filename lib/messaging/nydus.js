/**
 * @typedef NydusOptions
 * @property {Array<NydusConnectionOptions>} connections
 * @property {NydusCallback} [onReady]
 * @property {NydusConnectCallback} [onConnect]
 * @property {number} [tabId]
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
 * @typedef NydusConnectionPoolTabMap
 * @type Object.<number, NydusConnectionPool>
 * */

/**
 * @typedef NydusConnection
 * @property {string | number} id
 * @property {number} [tabId]
 * @property {chrome.runtime.Port} [connection]
 * @property {NYDUS_CONNECTION_ROLE} role
 * @property {boolean} ready
 * */

/**
 * @typedef NydusConnectionOptions
 * @property {string | number} id
 * @property {OnMessageCallback} [onMessage]
 * @property {boolean} host
 * @property {boolean} [isBackground]
 * */

/**
 * @readonly
 * @enum {number} NydusConnectionRole
 * */
const NYDUS_CONNECTION_ROLE = {
    HOST: 0,
    CLIENT: 1,
};

const NYDUS_CONNECTION_HANDSHAKE = 'NYDUS_CONNECTION_HANDSHAKE';
const NYDUS_TAB_PING = 'NYDUS_TAB_PING';

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
        /** @type {Array<NydusConnectionOptions>} */
        this.connectionOptions = nydusOptions.connections;
        /** @type {NydusCallback} */
        this.onReady = nydusOptions.onReady;
        /** @type {NydusConnectCallback} */
        this.onConnect = nydusOptions.onConnect;

        /** @type { NydusConnectionPoolTabMap } */
        this.connections = {};
        /** @type {boolean} */
        this.ready = false;

        this._whenReadyResolver = null;
        this.whenReady = new Promise(resolve => {
            this._whenReadyResolver = resolve;
        });

        this._needsToSpecifyTab = this._isDevtoolsComponent();
        this.nydusTab = null;

        this._createAllConnections();
    }

    async _createAllConnections() {
        await this._determineTabIds();
        this.connectionOptions.forEach(connectionOpts => {
            this.addConnection(
                connectionOpts.id,
                !connectionOpts.host,
                connectionOpts.onMessage,
                connectionOpts.isBackground,
            );
        });
    }

    /**
     *
     * Communication is important to keep tab-specific so that if the user has
     * 2 instances of WC DevTools open, they don't mix up each other.
     *
     * If the view has access to chrome.tabs, it means they are a background
     * task, and can easily query the tab. These ones will we make "Hosts" to
     * provide the tab info to others.
     *
     * Then others who can't access chrome.tabs, will send a one time message, hoping for an answer to this question.
     * */
    _determineTabIds() {
        return new Promise(resolve => {
            if (chrome.tabs) {
                chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                    if (request.type === NYDUS_TAB_PING) {
                        sendResponse({ type: NYDUS_TAB_PING, tabId: sender.tab?.id });
                    }
                });
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    this.nydusTab = tabs[0]?.id ?? chrome.devtools.inspectedWindow.tabId;
                });
                resolve();
            } else {
                chrome.runtime.sendMessage({ type: NYDUS_TAB_PING }, response => {
                    this.nydusTab = response.tabId;
                    resolve(response.tabId);
                });
            }
        });
    }

    /**
     * @param {number | string} connectionId
     * @param {boolean} isClient
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     */
    addConnection(connectionId, isClient, onMessage, isBackground = false) {
        if (this.connections[connectionId]) return; // No duplicates

        const nydusConnection = {
            id: connectionId,
            role: isClient ? NYDUS_CONNECTION_ROLE.CLIENT : NYDUS_CONNECTION_ROLE.HOST,
            ready: false,
        };

        this._doConnectionHandshake(nydusConnection, onMessage, isBackground);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     */
    addHostConnection(connectionId, onMessage, isBackground = false) {
        this.addConnection(connectionId, false, onMessage, isBackground);
    }

    /**
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     */
    addClientConnection(connectionId, onMessage) {
        this.addConnection(connectionId, true, onMessage, false);
    }

    /**
     * @param {string | number} recipient
     * @param {any} message
     */
    async message(recipient, message) {
        await this.whenReady;

        const tabId = await this._tryGetCurrentTab();
        let connPool = this.connections[tabId] ?? this.connections[-1];
        if (!connPool) return;

        const conn = connPool[recipient]?.connection;
        if (!conn) return;
        conn.postMessage({ ...message, tabId });
    }

    /**
     * @param {any} message
     */
    messageAll(message) {
        const connectionKeys = Object.keys(this.connections);
        connectionKeys.forEach(connKey => {
            const conn = this.connections[connKey];
            if (conn) conn.connection.postMessage(message);
        });
    }

    /**
     * @param {number} ms
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     */
    _doConnectionHandshake(nydusConnection, onMessage, isBackground) {
        if (nydusConnection.role === NYDUS_CONNECTION_ROLE.HOST) {
            this._doHostHandshake(nydusConnection, onMessage, isBackground);
        } else {
            this._doClientHandshake(nydusConnection, onMessage);
        }
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     */
    async _doHostHandshake(nydusConnection, onMessage, isBackground) {
        await this._delay(100);

        const connection = await this._createConnection(nydusConnection, isBackground);
        nydusConnection.connection = connection;

        connection.onMessage.addListener(
            function finishHandshake(/** @type {any} */ message) {
                this._handleConnectionHandshakeMessage(message, nydusConnection);
                connection.onMessage.removeListener(finishHandshake);
                if (onMessage) {
                    connection.onMessage.addListener(onMessage);
                }
            }.bind(this),
        );
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {boolean} isBackground
     */
    _createConnection(nydusConnection, isBackground) {
        return new Promise(async resolve => {
            // In devtools context we need to specify which tab to target

            let connection;
            let tabId;
            if (this._needsToSpecifyTab && !isBackground) {
                tabId = await this._tryGetCurrentTab();
                connection = chrome.tabs.connect(tabId, {
                    name: nydusConnection.id.toString(),
                });
            } else {
                tabId = -1;
                connection = chrome.runtime.connect({
                    name: nydusConnection.id.toString(),
                });
            }
            this._addConnectionToPool(tabId, nydusConnection);
            this._addConnectionOnDisconnectListeners(connection, nydusConnection.id.toString(), tabId);
            resolve(connection);
        });
    }

    /**
     * @param {chrome.runtime.Port} connection
     * @param {string | number} connectionId
     * @param {string | number} tabId
     */
    _addConnectionOnDisconnectListeners(connection, connectionId, tabId) {
        connection.onDisconnect.addListener(() => {
            delete this.connections[tabId][connectionId];
        });
    }

    _tryGetCurrentTab() {
        return new Promise(resolve => {
            if (!chrome.tabs) {
                return resolve(this.nydusTab ?? -1);
            }
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const tabId = tabs.length < 1 ? chrome.devtools.inspectedWindow.tabId : tabs[0].id;
                resolve(tabId ?? -1);
            });
        });
    }

    /**
     * Determine in which tabId Pool the connection should be
     * put into.
     *
     * Default to using the tab provided for the nydus. Fall back
     * to the sender's id, and last to -1.
     *
     * @param {chrome.runtime.Port} connection
     */
    _getConnectionTabId(connection) {
        if (!this.nydusTab) alert('FOO');
        return this.nydusTab ?? connection.sender?.tab?.id ?? -1;
    }

    /**
     * @param {number} tabId
     * @param {NydusConnection} nydusConnection
     */
    _addConnectionToPool(tabId, nydusConnection) {
        nydusConnection.tabId = tabId;
        if (!this.connections[tabId]) this.connections[tabId] = {};
        this.connections[tabId][nydusConnection.id] = nydusConnection;
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     */
    _doClientHandshake(nydusConnection, onMessage) {
        chrome.runtime.onConnect.addListener(
            function startHandshake(/** @type chrome.runtime.Port */ connection) {
                if (connection.name !== nydusConnection.id) return;
                nydusConnection.tabId = connection.sender?.tab?.id;
                // @ts-ignore
                this._handleClientHandshake(connection, nydusConnection);

                if (onMessage) {
                    connection.onMessage.addListener(onMessage);
                }
                this._addConnectionOnDisconnectListeners(
                    connection,
                    nydusConnection.id.toString(),
                    nydusConnection.tabId,
                );
            }.bind(this),
        );
    }

    _isDevtoolsComponent() {
        return typeof chrome.tabs !== 'undefined';
    }

    /**
     * @param {{type: string;id: any; tabId: number;}} message
     * @param {NydusConnection} nydusConnection
     */
    _handleConnectionHandshakeMessage(message, nydusConnection) {
        if (message.type !== NYDUS_CONNECTION_HANDSHAKE) return;

        const tabId = message.tabId;
        nydusConnection.tabId = tabId;
        nydusConnection.ready = true;

        this._doOnConnect(nydusConnection.connection);
        this._readyCheck();
    }

    /**
     * @param {chrome.runtime.Port} connection
     * @param {NydusConnection} nydusConnection
     */
    _handleClientHandshake(connection, nydusConnection) {
        nydusConnection.connection = connection;
        nydusConnection.ready = true;
        this._addConnectionToPool(this.nydusTab, nydusConnection);
        this._sendHandshake(nydusConnection);
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
     * @param {NydusConnection} nydusConnection
     */
    _sendHandshake(nydusConnection) {
        const connectionInstance = this.connections[nydusConnection.tabId][nydusConnection.id];
        connectionInstance.connection?.postMessage({
            type: NYDUS_CONNECTION_HANDSHAKE,
            id: connectionInstance.id,
            tabId: nydusConnection.tabId,
        });
    }

    async _readyCheck() {
        if (await this._requirementsFulfilled()) {
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

    _getConnectionsFlat() {
        let connections = [];
        Object.values
        for (const connPool of Object.values(this.connections)) {
            for (const conn of Object.values(connPool)) {
                connections.push(conn);
            }
        }

        return connections;
    }

    async _requirementsFulfilled() {
        // Check that all required connections are built and ready
        const connectionsFlat = this._getConnectionsFlat();
        return connectionsFlat.every(conn => conn.ready);
    }
}
