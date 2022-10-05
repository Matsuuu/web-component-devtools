export async function getCurrentTab() {
    const queryOpts = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOpts);
    return tab;
}
