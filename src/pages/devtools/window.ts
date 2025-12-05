import { DevtoolsElementTree } from "./components/devtools-element-tree";
import { WCDTPanel } from "./panel";

declare global {
    interface Window {
        panel: WCDTPanel;
        elementTree: DevtoolsElementTree;
    }
}
