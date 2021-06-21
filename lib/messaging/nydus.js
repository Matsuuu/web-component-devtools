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
 * @typedef NydusRequiredConnection
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

    /** @type { NydusConnectionPoolTabMap } */
    this.connections = {};
    /** @type {boolean} */
    this.ready = false;

    this._whenReadyResolver = null;
    this.whenReady = new Promise((resolve) => {
      this._whenReadyResolver = resolve;
    });

    this._needsToSpecifyTab = this._isDevtoolsComponent();
    this.affectedTab = null;

    this._createRequiredConnections();
  }

  _createRequiredConnections() {
    this.requiredConnections.forEach((requiredConnection) => {
      this.addConnection(
        requiredConnection.id,
        !requiredConnection.host,
        requiredConnection.onMessage,
        requiredConnection.isBackground
      );
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
      role: isClient
        ? NYDUS_CONNECTION_ROLE.CLIENT
        : NYDUS_CONNECTION_ROLE.HOST,
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
  async message(recipient, message) {
    const tabId = await this._tryGetCurrentTab();
    const conn = this.connections[tabId][recipient]?.connection;
    if (!conn) return;
    conn.postMessage(message);
  }

  /**
   * @param {any} message
   */
  messageAll(message) {
    const connectionKeys = Object.keys(this.connections);
    connectionKeys.forEach((connKey) => {
      const conn = this.connections[connKey];
      if (conn) conn.connection.postMessage(message);
    });
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

    const connection = await this._createConnection(
      nydusConnection,
      isBackground
    );
    nydusConnection.connection = connection;

    connection.onMessage.addListener(
      function finishHandshake(/** @type {any} */ message) {
        this._handleConnectionHandshakeMessage(message, nydusConnection);
        connection.onMessage.removeListener(finishHandshake);
        if (onMessage) {
          connection.onMessage.addListener(onMessage);
        }
      }.bind(this)
    );
  }

  /**
   * @param {NydusConnection} nydusConnection
   * @param {boolean} isBackground
   */
  _createConnection(nydusConnection, isBackground) {
    return new Promise(async (resolve) => {
      // In devtools context we need to specify which tab to target
      if (this._needsToSpecifyTab && !isBackground) {
        const tabId = await this._tryGetCurrentTab();
        const connection = chrome.tabs.connect(tabId, {
          name: nydusConnection.id.toString(),
        });
        this._addConnectionToPool(tabId, nydusConnection);

        resolve(connection);
      } else {
        const connection = chrome.runtime.connect({
          name: nydusConnection.id.toString(),
        });
        connection.onDisconnect.addListener(() => {
          delete this.connections[nydusConnection.id.toString()];
        });
        this._addConnectionToPool(-1, nydusConnection);
        resolve(connection);
      }
    });
  }

  _tryGetCurrentTab() {
    return new Promise((resolve) => {
      if (!chrome.tabs) {
        return resolve(this.affectedTab ?? -1);
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId =
          tabs.length < 1 ? chrome.devtools.inspectedWindow.tabId : tabs[0].id;
        resolve(tabId ?? -1);
      });
    });
  }

  /**
   * @param {chrome.runtime.Port} connection
   */
  _getConnectionTabId(connection) {
    return connection.sender?.tab?.id ?? -1;
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
        if (nydusConnection.tabId > 0 && !this.affectedTab) {
          // If we don't know which tab we are in, we get it from the client handshake
          this.affectedTab = nydusConnection.tabId;
        }
        this._handleClientHandshake(connection, nydusConnection);

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
    const tabId = this._getConnectionTabId(connection);
    this._addConnectionToPool(tabId, nydusConnection);
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
    const connectionInstance = this.connections[nydusConnection.tabId][
      nydusConnection.id
    ];
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

  async _requirementsFulfilled() {
    let requirementsFulfilled = true;
    const tabId = await this._tryGetCurrentTab();
    // Check that all required connections are built
    for (const conn of this.requiredConnections) {
      if (
        !this.connections[tabId][conn.id] ||
        !this.connections[tabId][conn.id].ready
      ) {
        requirementsFulfilled = false;
        break;
      }
    }

    return requirementsFulfilled;
  }
}
