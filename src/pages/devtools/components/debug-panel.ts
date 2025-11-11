import { SignalWatcher } from "@lit-labs/signals";
import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Cable, Check, RefreshCw, Trees, X } from "lucide";
import { devtoolsState } from "../state/devtools-context";
import { LAYER } from "@src/pages/messages/layers";
import { isPingMessage, PingMessage } from "@src/pages/messages/ping-message";

interface Connection {
    name: string;
    connected: boolean;
}

@customElement("debug-panel")
@withTailwind
export class DebugPanel extends SignalWatcher(LitElement) {
    autoRefreshTimeout: NodeJS.Timeout | null = null;

    @state()
    connections: Connection[] = [
        { name: LAYER.DEVTOOLS, connected: true },
        { name: LAYER.BACKGROUND, connected: false },
        { name: LAYER.CONTENT, connected: false },
        { name: LAYER.INPAGE, connected: false },
    ];

    @state()
    connectionsUpdateTimestamp = new Date();

    get autoRefresh() {
        return sessionStorage.getItem("auto-refresh") !== null;
    }

    updateConnectionsStatus() {
        // TODO: I wonder if this connection status thing should actually be put into the state
        // object and utilized by the actual tool
        this.connections.forEach(con => {
            con.connected = con.name === LAYER.DEVTOOLS;
        });

        const pingListener = (message: any) => {
            const data = message.data;

            if (isPingMessage(data)) {
                const con = this.connections.find(con => con.name === message.from);
                if (con) {
                    con.connected = true;
                }
            }
        };

        devtoolsState.messagePort.onMessage.addListener(pingListener);

        try {
            devtoolsState.messagePort.postMessage({
                from: LAYER.DEVTOOLS,
                to: LAYER.BACKGROUND,
                data: new PingMessage(),
            });
            devtoolsState.messagePort.postMessage({
                from: LAYER.DEVTOOLS,
                to: LAYER.CONTENT,
                data: new PingMessage(),
            });
            devtoolsState.messagePort.postMessage({
                from: LAYER.DEVTOOLS,
                to: LAYER.INPAGE,
                data: new PingMessage(),
            });
        } catch (ex) {}

        setTimeout(() => {
            this.connectionsUpdateTimestamp = new Date();
            this.requestUpdate();
            devtoolsState.messagePort.onMessage.removeListener(pingListener);
            setTimeout(() => {
                this.updateConnectionsStatus();
            }, 3000);
        }, 2000);
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        if (this.autoRefresh) {
            this.setAutoRefreshTimeout();
        }
        setTimeout(() => {
            this.updateConnectionsStatus();
        }, 1000);
    }

    setAutoRefreshTimeout() {
        this.autoRefreshTimeout = setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    clearAutoRefreshTimeout() {
        if (this.autoRefreshTimeout) {
            clearTimeout(this.autoRefreshTimeout);
        }
    }

    toggleAutoRefresh(ev: InputEvent) {
        const checked = (ev.target as HTMLInputElement).checked;
        if (checked) {
            sessionStorage.setItem("auto-refresh", "true");
            this.setAutoRefreshTimeout();
        } else {
            sessionStorage.removeItem("auto-refresh");
            this.clearAutoRefreshTimeout();
        }
    }

    render() {
        return html`
            <div class="flex flex-col gap-2 fixed bottom-0 right-0 p-2 bg-white">
                <div class="flex gap-4 items-center">
                    ${this.connections.map(
                        con => html`
                            ${con.connected
                                ? html`<span class="flex gap-2 items-center text-green-500"
                                      >${LucideIcon(Check, { size: 12 })} ${con.name}</span
                                  >`
                                : html`<span class="flex gap-2 items-center  text-red-500"
                                      >${LucideIcon(X, { size: 12 })} ${con.name}</span
                                  >`}
                        `,
                    )}
                </div>

                <div class="flex gap-4 items-center">
                    <p class="flex gap-2 items-center text-xs text-gray-500">
                        ${LucideIcon(Cable, { size: 12 })}
                        ${this.connectionsUpdateTimestamp.toLocaleTimeString() ?? "Not updated"}
                    </p>
                    <p class="flex gap-2 items-center text-xs text-gray-500">
                        ${LucideIcon(Trees, { size: 12 })}
                        ${devtoolsState.previousTreeUpdate.get()?.toLocaleTimeString() ?? "Not updated"}
                    </p>
                    <p class="flex gap-2 items-center text-xs text-gray-500">
                        ${LucideIcon(RefreshCw, { size: 12 })} ${new Date().toLocaleTimeString()}
                    </p>
                    <label class="flex gap-2 items-center">
                        Auto-refresh
                        <input type="checkbox" @input=${this.toggleAutoRefresh} ?checked=${this.autoRefresh} />
                    </label>
                    <button @click=${() => window.location.reload()} class="cursor-pointer">
                        ${LucideIcon(RefreshCw)}
                    </button>
                </div>
            </div>
        `;
    }
}
