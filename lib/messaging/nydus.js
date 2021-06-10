/**
 * @typedef NydusOptions
 * @property {Array<string | number>} requiredConnections
 * @property {NydusCallback} onBuild
 * @property {NydusCallback} onReady
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
 *  A Routing / Orchestration tool for concurrent connections between dev tools closures
 *
 * @class
 * */
class Nydus {
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
    }

    /**
     * @param {number | string} connectionId
     * @param {boolean} isClient
     */
    addConnection(connectionId, isClient = false) {
        if (this.connections[connectionId]) return; // No duplicates

        const nydusConnection = {
            id: connectionId,
            role: isClient
                ? NYDUS_CONNECTION_ROLE.CLIENT
                : NYDUS_CONNECTION_ROLE.HOST,
            ready: false,
        };

        this.connections[connectionId] = nydusConnection;
        this._doConnectionHandshake(nydusConnection);
    }

    /**
     * @param {NydusConnection} nydusConnection
     */
    _doConnectionHandshake(nydusConnection) {
        if (nydusConnection.role === NYDUS_CONNECTION_ROLE.HOST) {
            // TODO(Matsuuu): Some timeout here, so onConnect ones have time to exec?
            // TODO(Matsuuu): Clean this mess up
            setTimeout(() => {
                console.log("COnnecting");
                const connection = chrome.runtime.connect({
                    name: nydusConnection.id.toString(),
                });
                nydusConnection.connection = connection;

                connection.onMessage.addListener(function finishHandshake(message) {
                    this._handleConnectionHandshakeMessage(message)
                    connection.onMessage.removeListener(finishHandshake);
                }.bind(this));
            }, 2000);
        } else {
            console.log("Listening");
            chrome.runtime.onConnect.addListener(function startHandshake(connection) {
                this._handleClientHandshake(connection);
                chrome.runtime.onConnect.removeListener(startHandshake);
            }.bind(this));
        }
    }

    /**
     * @param {{ type: string; id: any; }} message
     */
    _handleConnectionHandshakeMessage(message) {
        if (message.type !== NYDUS_CONNECTION_HANDSHAKE) return;

        console.log("HOST GOT HANDSHAKE");

        const connectionId = message.id;
        const connectionInstance = this.connections[connectionId];
        connectionInstance.ready = true;

        this._readyCheck();
        console.log(this);
    }

    /**
     * @param {chrome.runtime.Port} connection
     */
    _handleClientHandshake(connection) {
        const nydusConnection = this.connections[connection.name];
        nydusConnection.connection = connection;
        nydusConnection.ready = true;
        this._sendHandshake(nydusConnection.id);
        this._readyCheck();
        console.log(this);
    }

    /**
     * @param {string | number} connectionId
     */
    _sendHandshake(connectionId) {
        console.log("SENDING HANDSHAKE", this);
        const connectionInstance = this.connections[connectionId];
        connectionInstance.connection?.postMessage({
            type: NYDUS_CONNECTION_HANDSHAKE,
            id: connectionInstance.id,
        });
    }

    _readyCheck() {
        if (this._requirementsFulfilled()) {
            this._whenReadyResolver(this);
            this.doOnReady();
        }
    }

    /**
     * @param {string | number} recipient
     * @param {any} message
     */
    message(recipient, message) {
        this.connections[recipient]?.connection?.postMessage(message);
    }

    /**
     * Trigger onReady, and pass the nydus instance to it
     * */
    doOnReady() {
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
