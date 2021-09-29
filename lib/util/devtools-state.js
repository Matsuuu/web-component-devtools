export function isDarkMode() {
    const themeName = chrome?.devtools?.panels?.themeName
    if (themeName === "dark") return true;
    return document.body.hasAttribute("dark-mode");
}
