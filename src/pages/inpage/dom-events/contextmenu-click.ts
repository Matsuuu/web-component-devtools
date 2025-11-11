import { inpageState } from "../inpage-state";

export function trackContextMenuClicks() {
    document.addEventListener("contextmenu", event => {
        if (event.target instanceof Element) {
            inpageState.previousContextMenuTarget = event.target;
            console.log("Context menu on ", inpageState.previousContextMenuTarget);
        }
    });
}
