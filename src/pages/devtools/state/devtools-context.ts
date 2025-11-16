import { Signal } from "@lit-labs/signals";
import { TreeElement } from "@src/pages/content/lib/element";
import { SerializedAnalyzedElement } from "@src/pages/inpage/analyzer/serialized-analyzed-element";
import browser from "webextension-polyfill";
import { isFreezePanelOn } from "../components/debug-panel";

export class DevtoolsState {
    public messagePort!: browser.Runtime.Port;
    public elementTree = new Signal.State<TreeElement | undefined>(undefined);
    public highlightAll = new Signal.State(false);
    public selectedItem = new Signal.State<TreeElement | undefined>(undefined);
    public selectedItemDetails = new Signal.State<SerializedAnalyzedElement | undefined>(undefined);
    public previousTreeUpdate = new Signal.State<Date | undefined>(undefined);

    constructor() {
        if (isFreezePanelOn()) {
            this.applyFrozenUiState();
        }
    }

    public onChange(stateObject: Signal.State<any>, callback: Function) {
        const watcher = new Signal.subtle.Watcher(async () => {
            // Notify callbacks are not allowed to access signals synchronously
            await 0;
            callback();
            watcher.watch();
        });
        watcher.watch(stateObject);
    }

    /**
     * Store the Panel state in localStorage for UI development ease
     * */
    public freezeState() {
        const uiState = {
            elementTree: this.elementTree.get(),
            selectedItem: this.selectedItem.get(),
            selectedItemDetails: this.selectedItemDetails.get(),
        };

        localStorage.setItem("FROZEN_UI_STATE", JSON.stringify(uiState));
    }

    public applyFrozenUiState() {
        console.log("Applying state");
        const state = JSON.parse(localStorage.getItem("FROZEN_UI_STATE") || "{}");

        this.elementTree.set(state.elementTree);
        this.selectedItem.set(state.selectedItem);
        this.selectedItemDetails.set(state.selectedItemDetails);
        console.log(state);
    }
}

export const devtoolsState = new DevtoolsState();
