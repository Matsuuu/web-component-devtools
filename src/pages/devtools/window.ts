import { DevtoolsElementTree } from "./components/devtools-element-tree";
import { WCDTPanel } from "./panel";
import { DevtoolsState } from "./state/devtools-context";

declare global {
    interface Window {
        panel: WCDTPanel;
        elementTree: DevtoolsElementTree;
        devtoolsState: DevtoolsState;
    }
}
