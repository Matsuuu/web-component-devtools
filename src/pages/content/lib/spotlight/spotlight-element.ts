const ELEM_ID = "wc-devtools-spotlight-element";
let currentElement: HTMLDivElement | undefined = undefined;
let spotlightRemoveTimeout: NodeJS.Timeout;

export function getSpotlightElement() {
    if (currentElement) {
        setTimeout(() => {
            cancelSpotlightRemoveRequest();
        }, 50);
        return currentElement;
    }
    return createSpotlightElement();
}

export function createSpotlightElement() {
    const spot = document.createElement("div");
    spot.id = ELEM_ID;
    currentElement = spot;

    document.body.appendChild(spot);
    return spot;
}

export function removeSpotlightElement() {
    const elem = document.querySelector("#" + ELEM_ID);
    elem?.remove();
    currentElement = undefined;
}

export function requestSpotlightRemove() {
    cancelSpotlightRemoveRequest();
    spotlightRemoveTimeout = setTimeout(() => {
        removeSpotlightElement();
    }, 2000);
    console.log("Remove timeout created");
}

export function cancelSpotlightRemoveRequest() {
    clearTimeout(spotlightRemoveTimeout);
}

export function moveSpotlight(rect: DOMRect) {
    const spot = getSpotlightElement();

    const width = Math.min(rect.x + rect.width, window.innerWidth - rect.x);
    const height = Math.min(rect.y + rect.height, window.innerHeight - rect.y);

    spot.style.setProperty("--width", width + "px");
    spot.style.setProperty("--height", height + "px");
    spot.style.setProperty("--x", rect.x + "px");
    spot.style.setProperty("--y", rect.y + "px");
}
