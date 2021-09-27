/**
 * @param {KeyboardEvent} event
 */
export function isConsoleSubmit(event) {
    return event.key === "Enter" && event.ctrlKey;
}

export function isConsoleClear(event) {
    return event.key === "l" && event.ctrlKey;
}
