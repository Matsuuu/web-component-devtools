/**
 * @param {KeyboardEvent} event
 */
export function isConsoleSubmit(event) {
    return (event.key === "Enter" && event.ctrlKey) ||
        (event.key === "Enter" && event.metaKey);
}

/**
 * @param {KeyboardEvent} event
 */
export function isSelectAll(event) {
    return event.key === "a" && event.ctrlKey;
}

export function isConsoleClear(event) {
    return (event.key === "l" && event.ctrlKey) ||
        (event.key === "k" && event.metaKey);
}

export function isArrowUpOrDown(event) {
    return event.key === "ArrowUp" || event.key === "ArrowDown";
}

export function isSideArrow(event) {
    return event.key === "ArrowLeft" || event.key === "ArrowRight";
}

export function isEscape(event) {
    return event.key === "Escape";
}

export function raf() {
    return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

