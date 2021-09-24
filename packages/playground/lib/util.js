export function isConsoleSubmit(event) {
    return event.code === "Enter" && event.ctrlKey;
}
