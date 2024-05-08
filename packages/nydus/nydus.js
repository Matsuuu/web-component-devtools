/**
 * @typedef NydusOptions
 * @property {Array<NydusConnectionOptions>} connections
 * @property {NydusCallback} [onReady]
 * @property {NydusConnectCallback} [onConnect]
 * @property{boolean} [isBackground]
 * */

/**
 * @callback NydusConnectCallback
 * @param {Nydus} nydus
 * @param {chrome.runtime.Port} connection
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
 * @property {string | number} [bridge]
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
    return;
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
        /** @type {number} */
        this._latestActivatedTab = -1;
        /** @type {Array<NydusConnectionOptions>} */
        this.connectionOptions = nydusOptions.connections;
        /** @type {NydusCallback} */
        this.onReady = nydusOptions.onReady;
        /** @type {NydusConnectCallback} */
        this.onConnect = nydusOptions.onConnect;
        /** @type {boolean} */
        this.isBackground = nydusOptions.isBackground;

        if (this.isBackground) {
            console.log("[Nydus]: Instantiating nydus. ", nydusOptions);
        }
        /** @type { NydusConnectionPoolTabMap } */
        this.connections = {};
        /** @type {boolean} */
        this.ready = false;

        this._whenReadyResolver = null;
        this.whenReady = new Promise(resolve => {
            this._whenReadyResolver = resolve;
        });

        this._needsToSpecifyTab = this._canAccessTabs();
        this.nydusTab = null;

        this._listenForTabChanges();
        this._createAllConnections();
    }

    _listenForTabChanges() {
        if (!chrome.tabs) return;

        chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
            if (tabId >= 0) {
                this._latestActivatedTab = tabId;
            }
        });
    }

    _setActiveTabAsLatestActivatedTab() {
        chrome.tabs?.query({ active: true, currentWindow: true }, tabs => {
            this._latestActivatedTab = tabs[0]?.id ?? this._latestActivatedTab;
        });
    }

    async _createAllConnections() {
        await this._determineTabIds();
        this.connectionOptions.forEach(connectionOpts => {
            this.addConnection(
                connectionOpts.id,
                !connectionOpts.host,
                connectionOpts.onMessage,
                connectionOpts.isBackground,
                connectionOpts.bridge,
            );
        });
    }

    async _reConnectDisconnected() {
        await this._determineTabIds();
        const connectionsFlat = this._getConnectionsFlat();
        this.connectionOptions.forEach(connectionOpts => {
            if (!connectionsFlat.find(con => con.id === connectionOpts.id)?.ready) {
                this.addConnection(
                    connectionOpts.id,
                    !connectionOpts.host,
                    connectionOpts.onMessage,
                    connectionOpts.isBackground,
                    connectionOpts.bridge,
                );
            }
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
     * Then others who can't access chrome.tabs, will send a one time message,
     * hoping for an answer to this question.
     *
     * This function is promisified so that we can make sure we have caught a tab ID before
     * proceeding with other actions.
     * */
    _determineTabIds() {
        return new Promise(resolve => {
            if (chrome.tabs) {
                chrome?.runtime?.onMessage.addListener(function(request, sender, sendResponse) {
                    if (request.type === NYDUS_TAB_PING) {
                        const senderTabId = sender.tab?.id;
                        sendResponse({ type: NYDUS_TAB_PING, tabId: senderTabId });
                    }
                });
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    this.nydusTab = tabs[0]?.id ?? chrome?.devtools?.inspectedWindow?.tabId ?? this._latestActivatedTab;
                    resolve();
                });
            } else {
                chrome?.runtime?.sendMessage({ type: NYDUS_TAB_PING }, response => {
                    if (!response) return resolve();

                    let tabId = response.tabId;
                    if (!tabId) {
                        tabId = chrome?.devtools?.inspectedWindow?.tabId;
                    }
                    this.nydusTab = tabId;
                    resolve(tabId);
                });
            }
        });
    }

    /**
     * Add a connection to the Nydus with a given ID
     *
     * @param {number | string} connectionId
     * @param {boolean} isClient
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     * @param {string | number} bridge
     */
    addConnection(connectionId, isClient, onMessage, isBackground = false, bridge) {
        if (this.connections[connectionId]) {
            console.warn("[WebComponentDevTools]: Duplicate connection attempt");
            return; // No duplicates
        }

        const nydusConnection = {
            id: connectionId,
            role: isClient ? NYDUS_CONNECTION_ROLE.CLIENT : NYDUS_CONNECTION_ROLE.HOST,
            ready: false,
        };

        this._doConnectionHandshake(nydusConnection, onMessage, isBackground, bridge);
    }

    /**
     * Add a connection to Nydus as a host connector.
     *
     * Being a host means that you createa connection, and expect
     * a client to be listening for it, and approve it with a handshake.
     *
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     * @param {string | number} bridge
     */
    addHostConnection(connectionId, onMessage, isBackground = false, bridge) {
        this.addConnection(connectionId, false, onMessage, isBackground, bridge);
    }

    /**
     * Add a connection to Nydus as a client connector.
     *
     * Being a client means that you are listening for a Host
     * to create a connection, and then after a handshake can communicate
     *
     * @param {string | number} connectionId
     * @param {OnMessageCallback} onMessage
     * @param {string | number} bridge
     */
    addClientConnection(connectionId, onMessage, bridge) {
        this.addConnection(connectionId, true, onMessage, false, bridge);
    }

    /**
     * Messages the desired Nydus Connection is one
     * is found with the name/id provided
     *
     * @param {string | number} recipient
     * @param {any} message
     */
    async message(recipient, message, _retryCount = 0) {
        await this.whenReady;

        const tabId = message.tabId ?? (await this._tryGetCurrentTab());
        let connPool = this.connections[tabId] ?? this.connections[-1];
        if (!connPool) {
            if (_retryCount >= 5) {
                console.warn(
                    `[WebComponentDevTools]: Message send missed. Tab connection pool for tab ${tabId} not found.`,
                    JSON.stringify({
                        recipient,
                        message: message.length > 200 ? message.substring(0, 200) + "..." : message,
                        tabId,
                    }),
                );
            } else {
                await this._delay(200);
                this.message(recipient, message, _retryCount + 1);
            }
            return;
        }

        const conn = connPool[recipient]?.connection;
        if (!conn) {
            if (_retryCount >= 5) {
                console.warn(
                    `[WebComponentDevTools]: Message send missed. Connection ${recipient} not found.`,
                    JSON.stringify({
                        recipient,
                        message: message.length > 200 ? message.substring(0, 200) + "..." : message,
                        tabId,
                    }),
                );
            } else {
                await this._delay(200);
                this.message(recipient, message, _retryCount + 1);
            }
            return;
        }
        conn.postMessage({ ...message, tabId });
    }

    /**
     * Messages all of the connections in the Nydus Connection Pool
     *
     * @param {any} message
     */
    messageAll(message) {
        Object.values(this.connections).forEach(connPool => {
            connPool.forEach((/** @type {NydusConnection} */ conn) => {
                conn.connection.postMessage(message);
            });
        });
    }

    /**
     * Awaitable timeout
     *
     * @param {number} ms
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     * @param {string | number} bridge
     */
    _doConnectionHandshake(nydusConnection, onMessage, isBackground, bridge) {
        if (nydusConnection.role === NYDUS_CONNECTION_ROLE.HOST) {
            this._doHostHandshake(nydusConnection, onMessage, isBackground, bridge);
        } else {
            this._doClientHandshake(nydusConnection, onMessage, isBackground, bridge);
        }
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {OnMessageCallback} onMessage
     * @param {boolean} isBackground
     * @param {string | number} bridge
     */
    async _doClientHandshake(nydusConnection, onMessage, isBackground, bridge) {
        // We delay the connector init a bit to avoid race conditions
        // This could maybe be removed later, but needs testing
        await this._delay(100);

        const connection = await this._createConnection(nydusConnection, isBackground);
        nydusConnection.connection = connection;

        let handShakeFinisher;
        /** @this { Nydus } */
        function finishHandshake(/** @type {any} */ message) {
            if (message.type !== NYDUS_CONNECTION_HANDSHAKE) return;

            connection.onMessage.removeListener(handShakeFinisher);

            this._handleConnectionHandshakeMessage(message, nydusConnection);

            if (bridge) {
                const onBridgeMessage = message => this.message(bridge, message);

                connection.onMessage.addListener(onBridgeMessage);
                connection.onDisconnect.addListener(() => {
                    console.log("ON DISCONNECT");
                    connection.onMessage.removeListener(onBridgeMessage);
                });
            }

            if (onMessage) {
                connection.onMessage.addListener(onMessage);
                connection.onDisconnect.addListener(() => {
                    console.log("ON DISCONNECT");
                    connection.onMessage.removeListener(onMessage);
                });
            }
        }

        handShakeFinisher = finishHandshake.bind(this);

        connection.onMessage.addListener(handShakeFinisher);
    }

    disconnectAll() {
        const connections = this._getConnectionsFlat();
        connections.forEach(conn => {
            conn.connection.disconnect();
        });
    }

    /**
     * @param {NydusConnection} nydusConnection
     * @param {boolean} isBackground
     */
    _createConnection(nydusConnection, isBackground) {
        return new Promise(async (resolve, reject) => {
            let connection;
            let tabId;

            // In devtools context we need to specify which tab to target
            try {
                if (this._canAccessTabs() && !isBackground) {
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
            } catch (ex) {
                reject("Could not establish connection between layers.\n\n" + ex)
            }
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
            if (Object.keys(this.connections[tabId]).length <= 0) {
                delete this.connections[tabId];
            }
        });
    }

    _tryGetCurrentTab() {
        return new Promise(resolve => {
            if (!this._canAccessTabs()) {
                return resolve(this.nydusTab ?? -1);
            }
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const tabId = (tabs.length < 1 ? chrome?.devtools?.inspectedWindow?.tabId : tabs[0].id) ?? this._latestActivatedTab;
                resolve(tabId ?? -1);
            });
        });
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
     * @param {boolean} isBackground
     * @param {string | number} bridge
     */
    _doHostHandshake(nydusConnection, onMessage, isBackground, bridge) {
        chrome.runtime.onConnect.addListener(
            /** @this Nydus */
            async function startHandshake(/** @type chrome.runtime.Port */ connection) {
                if (connection.name !== nydusConnection.id) return;

                if (this.isBackground) {
                    this._setActiveTabAsLatestActivatedTab();
                }

                let tabId = connection?.sender?.tab?.id;
                if (!tabId || tabId < 0) {
                    tabId = await this._tryGetCurrentTab();
                }
                let nydusConnectionCopy = { ...nydusConnection };
                nydusConnectionCopy.tabId = isBackground ? -1 : tabId ?? this.nydusTab;
                if (this.isBackground) {
                    console.warn("[Nydus]: Setting up connection ", nydusConnectionCopy)
                }
                this._handleClientHandshake(connection, nydusConnectionCopy);

                // If we are instructed to bridge the connection, just send the message
                // to the bridges recipient
                if (bridge) {
                    const onBridgeMessage = message => this.message(bridge, message);
                    connection.onMessage.addListener(message => this.message(bridge, message));
                    connection.onDisconnect.addListener(() => {
                        connection.onMessage.removeListener(onBridgeMessage);
                    });
                }
                if (onMessage) {
                    // If we're not bridging, we check if we have
                    // a onmessage listener and apply that instead
                    connection.onMessage.addListener(onMessage);
                    connection.onDisconnect.addListener(() => {
                        connection.onMessage.removeListener(onMessage);
                    });
                }
                this._addConnectionOnDisconnectListeners(
                    connection,
                    nydusConnectionCopy.id.toString(),
                    nydusConnectionCopy.tabId,
                );
            }.bind(this),
        );
    }

    _canAccessTabs() {
        return typeof chrome.tabs !== 'undefined';
    }

    /**
     * @param {{type: string;id: any; tabId: number;}} message
     * @param {NydusConnection} nydusConnection
     */
    _handleConnectionHandshakeMessage(message, nydusConnection) {
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
        this._addConnectionToPool(nydusConnection.tabId, nydusConnection);
        this._sendHandshake(nydusConnection);
        this._doOnConnect(connection);
        this._readyCheck();
    }

    /**
     * Trigger the onConnect callback of the Nydus instance
     *
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

    _readyCheck() {
        if (this._requirementsFulfilled()) {
            // Resolve the whenReady promise for those listening for it
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
        for (const connPool of Object.values(this.connections)) {
            for (const conn of Object.values(connPool)) {
                connections.push(conn);
            }
        }

        return connections;
    }

    _requirementsFulfilled() {
        // Check that all required connections are built and ready
        const connectionsFlat = this._getConnectionsFlat();

        const hasOneOfEachRequiredConnection = this.connectionOptions.every(opt => {
            const connectionsToOpt = connectionsFlat.filter(con => con.id === opt.id);
            return connectionsToOpt.some(con => con.ready);
        });
        return hasOneOfEachRequiredConnection;
    }
}
