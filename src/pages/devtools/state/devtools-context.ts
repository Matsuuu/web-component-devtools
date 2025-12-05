import { Signal } from "@lit-labs/signals";
import { ElementId, TreeElement } from "@src/pages/content/lib/element";
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

    public elementTreeLookup = new Map<ElementId, TreeElement>();

    constructor() {
        window.devtoolsState = this;
        if (isFreezePanelOn()) {
            this.applyFrozenUiState();
        }
        this.createLookupTreeListeners();
    }

    /**
     * Gets the currently selected item and walks up the tree,
     * saving each TreeElement into an array.
     * */
    public getSelectedItemParentElements() {
        const parentArray: TreeElement[] = [];

        let current = this.selectedItem.get();
        if (!current) {
            return parentArray;
        }

        parentArray.push(current);
        while (current && current.parentId) {
            current = this.elementTreeLookup.get(current.parentId);

            if (current) {
                parentArray.push(current);
            }
        }

        return parentArray.reverse();
    }

    /**
     * We will construct a lookup tree for the elements in our tree for faster access to any
     * element via their ID, saving us time and headache of climbing trees.
     * */
    private createLookupTreeListeners() {
        this.onChange(this.elementTree, () => {
            // Construct a lookup tree for other parts of the tree to easily find elements from
            this.elementTreeLookup.clear();

            const treeElement = this.elementTree.get();
            if (!treeElement) {
                return;
            }
            const lookupper = (treeElement: TreeElement) => {
                this.elementTreeLookup.set(treeElement.id, treeElement);
                treeElement.children.forEach(child => lookupper(child));
                // TODO: Should we save the path to each element so that we can open the tree
                // on e.g. inspects?
            };

            lookupper(treeElement);
        });
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
    }
}

export const devtoolsState = new DevtoolsState();
