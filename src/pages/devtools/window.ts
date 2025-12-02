import { WCDTPanel } from "./panel";

declare global {
    interface Window {
        panel: WCDTPanel;
    }
}
