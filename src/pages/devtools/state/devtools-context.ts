import { Signal } from "@lit-labs/signals";
import { TreeElement } from "@src/pages/content/lib/element";

export class DevtoolsState {
    public messagePort!: chrome.runtime.Port;
    public elementTree = new Signal.State<TreeElement>(new TreeElement(document.body));
    public highlightAll = new Signal.State(false);
    public selectedItem = new Signal.State<TreeElement | undefined>(undefined);

    public onChange(stateObject: Signal.State<any>, callback: Function) {
        const watcher = new Signal.subtle.Watcher(async () => {
            // Notify callbacks are not allowed to access signals synchronously
            await 0;
            callback();
            watcher.watch();
        });
        watcher.watch(stateObject);
    }
}

export const devtoolsState = new DevtoolsState();
